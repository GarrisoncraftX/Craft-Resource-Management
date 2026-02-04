from typing import Optional, Dict, Any, List, Tuple
import json
from datetime import datetime, timedelta

from src.database.connection import DatabaseManager
from src.utils.logger import logger

class BiometricModel:
    def __init__(self, db_manager: DatabaseManager):
        self.db = db_manager
    
    def enroll_biometric(self, user_id: Optional[str], visitor_id: Optional[str],
                        biometric_type: str, template_data: str, template_hash: str) -> Dict[str, Any]:
        """Store biometric template in database"""
        try:
            query = """
                INSERT INTO biometric_templates (user_id, visitor_id, biometric_type, template_data, template_hash, enrollment_date)
                VALUES (%s, %s, %s, %s, %s, %s)
            """

            biometric_id = self.db.execute_query(
                query,
                (user_id, visitor_id, biometric_type, template_data, template_hash, datetime.now()),
                fetch=False
            )

            # Update user's biometric enrollment status if user_id is provided
            if user_id:
                update_query = """
                    UPDATE users
                    SET biometric_enrollment_status = 'ENROLLED', updated_at = %s
                    WHERE id = %s
                """
                self.db.execute_query(update_query, (datetime.now(), user_id), fetch=False)
                logger.info(f"Updated biometric enrollment status for user {user_id}")

            logger.info(f"Biometric enrolled successfully: {biometric_id}")

            return {
                'biometric_id': biometric_id,
                'template_hash': template_hash
            }

        except Exception as e:
            logger.error(f"Error enrolling biometric: {e}")
            raise e
    
    def get_biometric_template(self, user_id: str, biometric_type: str) -> Optional[str]:
        """Retrieve stored biometric template for user"""
        try:
            query = """
                SELECT template_data FROM biometric_templates
                WHERE user_id = %s AND biometric_type = %s
                ORDER BY enrollment_date DESC LIMIT 1
            """

            result = self.db.execute_query(query, (user_id, biometric_type))

            if result:
                template_data = result[0]['template_data']
                if isinstance(template_data, bytes):
                    return template_data
                return template_data
            return None

        except Exception as e:
            logger.error(f"Error retrieving biometric template: {e}")
            raise e
    
    def get_all_templates(self, biometric_type: str) -> List[Dict[str, Any]]:
        """Retrieve all stored templates of a specific type for identification"""
        try:
            query = """
                SELECT b.user_id, b.template_data, u.first_name, u.last_name, u.employee_id
                FROM biometric_templates b
                LEFT JOIN users u ON b.user_id = u.id
                WHERE b.biometric_type = %s AND b.user_id IS NOT NULL
            """

            results = self.db.execute_query(query, (biometric_type,))

            if results:
                # Handle BLOB data returned as bytes
                for result in results:
                    if isinstance(result['template_data'], bytes):
                        result['template_data'] = result['template_data'].decode('utf-8')

            return results or []

        except Exception as e:
            logger.error(f"Error retrieving all templates: {e}")
            raise e
    
    def lookup_card(self, card_identifier: str) -> Optional[Dict[str, str]]:
        """Look up card holder information"""
        try:
            query = """
                SELECT holder_type, holder_id FROM id_cards 
                WHERE card_unique_identifier = %s AND is_active = TRUE
            """
            
            result = self.db.execute_query(query, (card_identifier,))
            
            if result:
                return {
                    'holder_type': result[0]['holder_type'],
                    'holder_id': result[0]['holder_id']
                }
            return None
            
        except Exception as e:
            logger.error(f"Error looking up card: {e}")
            raise e
    
    def log_biometric_access(self, user_id: Optional[str], biometric_type: str,
                           access_type: str, success: bool, details: Optional[Dict] = None):
        """Log biometric access attempts"""
        try:
            query = """
                INSERT INTO biometric_access_logs (user_id, biometric_type, access_type, success, additional_data, access_time)
                VALUES (%s, %s, %s, %s, %s, %s)
            """

            self.db.execute_query(
                query,
                (user_id, biometric_type, access_type, success, json.dumps(details) if details else None, datetime.now()),
                fetch=False
            )

        except Exception as e:
            logger.error(f"Error logging biometric access: {e}")
            # Don't raise here as this is just logging

    def log_attendance(self, user_id: str, action: str, method: str, success: bool, details: Optional[Dict] = None):
        """Log attendance transactions for audit purposes"""
        try:
            query = """
                INSERT INTO attendance_audit_logs (user_id, action, method, success, details, timestamp)
                VALUES (%s, %s, %s, %s, %s, %s)
            """

            self.db.execute_query(
                query,
                (user_id, action, method, success, json.dumps(details) if details else None, datetime.now()),
                fetch=False
            )

        except Exception as e:
            logger.error(f"Error logging attendance: {e}")
            # Don't raise here as this is just logging

    def get_employee_last_attendance(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get employee's last attendance record to determine check-in/out action"""
        try:
            query = """
                SELECT clock_in_time, clock_out_time, status
                FROM attendance_records
                WHERE user_id = %s
                ORDER BY clock_in_time DESC
                LIMIT 1
            """

            result = self.db.execute_query(query, (user_id,))

            if result:
                record = result[0]
                return {
                    'clock_in_time': record['clock_in_time'],
                    'clock_out_time': record['clock_out_time'],
                    'status': record.get('status', 'unknown')
                }
            return None

        except Exception as e:
            logger.error(f"Error getting last attendance for user {user_id}: {e}")
            raise e

    def record_attendance(self, user_id: str, action: str, method: str, location: Optional[str] = None) -> Dict[str, Any]:
        """Record attendance check-in or check-out"""
        try:
            now = datetime.now()
            today = now.date()

            if action == 'clock_in':
                # Check if user already has a record for today
                check_query = """
                    SELECT id, clock_in_time, clock_out_time 
                    FROM attendance_records
                    WHERE user_id = %s AND DATE(clock_in_time) = %s
                    ORDER BY clock_in_time DESC
                    LIMIT 1
                """
                existing_record = self.db.execute_query(check_query, (user_id, today))
                
                if existing_record and len(existing_record) > 0:
                    record = existing_record[0]
                    # If they already checked in today and haven't checked out, don't create new record
                    if record['clock_out_time'] is None:
                        logger.warning(f"User {user_id} already checked in today at {record['clock_in_time']}")
                        return {
                            'record_id': record['id'],
                            'action': 'already_checked_in',
                            'timestamp': record['clock_in_time'].isoformat(),
                            'message': 'Already checked in today',
                            'method': method
                        }
                    # If they checked out, don't allow another check-in for the same day
                    else:
                        logger.warning(f"User {user_id} already completed attendance for today")
                        return {
                            'record_id': record['id'],
                            'action': 'already_completed',
                            'timestamp': now.isoformat(),
                            'message': 'Attendance already completed for today',
                            'method': method
                        }
                
                # Get work start time from settings (default 09:00:00)
                settings_query = "SELECT setting_value FROM system_settings WHERE setting_key = 'attendance_work_start_time'"
                work_start_result = self.db.execute_query(settings_query)
                work_start_time_str = work_start_result[0]['setting_value'] if work_start_result else '09:00:00'
                
                # Get late threshold (default 0 minutes)
                late_threshold_query = "SELECT setting_value FROM system_settings WHERE setting_key = 'attendance_late_threshold_minutes'"
                late_threshold_result = self.db.execute_query(late_threshold_query)
                late_threshold_minutes = int(late_threshold_result[0]['setting_value']) if late_threshold_result else 0
                
                # Calculate if late
                from datetime import time as dt_time
                work_start_parts = work_start_time_str.split(':')
                work_start_time = dt_time(int(work_start_parts[0]), int(work_start_parts[1]), int(work_start_parts[2]) if len(work_start_parts) > 2 else 0)
                
                work_start_datetime = datetime.combine(today, work_start_time)
                late_threshold_datetime = work_start_datetime + timedelta(minutes=late_threshold_minutes)
                
                # Determine status based on clock-in time
                if now <= late_threshold_datetime:
                    status = 'present'  # On time
                else:
                    status = 'late'
                
                # Insert new attendance record
                query = """
                    INSERT INTO attendance_records (user_id, clock_in_time, clock_in_method, clock_out_method, status, location, created_at, updated_at)
                    VALUES (%s, %s, %s, NULL, %s, %s, %s, %s)
                """
                params = (user_id, now, method, status, location, now, now)
                record_id = self.db.execute_query(query, params, fetch=False)
                
                logger.info(f"Clock-in recorded: user_id={user_id}, method={method}, status={status}, record_id={record_id}")

                return {
                    'record_id': record_id,
                    'action': 'clock_in',
                    'timestamp': now.isoformat(),
                    'status': status,
                    'method': method
                }

            elif action == 'clock_out':
                # Find today's open attendance record
                query = """
                    UPDATE attendance_records
                    SET clock_out_time = %s, clock_out_method = %s, 
                        total_hours = TIMESTAMPDIFF(MINUTE, clock_in_time, %s) / 60.0, 
                        updated_at = %s
                    WHERE user_id = %s AND DATE(clock_in_time) = %s AND clock_out_time IS NULL
                    ORDER BY clock_in_time DESC
                    LIMIT 1
                """
                params = (now, method, now, now, user_id, today)
                affected_rows = self.db.execute_query(query, params, fetch=False)
                
                logger.info(f"Clock-out recorded: user_id={user_id}, method={method}, affected_rows={affected_rows}")

                if affected_rows == 0:
                    raise Exception("No open attendance record found for today")

                return {
                    'action': 'clock_out',
                    'timestamp': now.isoformat(),
                    'method': method
                }

            else:
                raise Exception(f"Invalid action: {action}")

        except Exception as e:
            logger.error(f"Error recording attendance for user {user_id}: {e}")
            raise e
    
    def get_biometric_statistics(self, filters: Optional[Dict] = None) -> Dict[str, Any]:
        """Get biometric system statistics"""
        try:
            base_query = """
                SELECT
                    COUNT(*) as total_enrollments,
                    COUNT(DISTINCT user_id) as unique_users,
                    COUNT(CASE WHEN biometric_type IN ('card', 'idcard') THEN 1 END) as card_enrollments
                FROM biometric_templates
                WHERE user_id IS NOT NULL
            """
            
            params = []
            
            if filters:
                if filters.get('start_date'):
                    base_query += " AND enrollment_date >= %s"
                    params.append(filters['start_date'])
                
                if filters.get('end_date'):
                    base_query += " AND enrollment_date <= %s"
                    params.append(filters['end_date'])
            
            result = self.db.execute_query(base_query, tuple(params))
            
            if result:
                stats = result[0]
                stats['generated_at'] = datetime.now().isoformat()
                return stats
            
            return {
                'total_enrollments': 0,
                'unique_users': 0,
                'card_enrollments': 0,
                'generated_at': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Error getting biometric statistics: {e}")
            raise e
    
    def delete_biometric_template(self, user_id: str, biometric_type: str) -> bool:
        """Delete biometric template for user"""
        try:
            query = """
                DELETE FROM biometric_templates
                WHERE user_id = %s AND biometric_type = %s
            """

            affected_rows = self.db.execute_query(query, (user_id, biometric_type), fetch=False)

            logger.info(f"Deleted {affected_rows} biometric template(s) for user {user_id}")
            return affected_rows > 0

        except Exception as e:
            logger.error(f"Error deleting biometric template: {e}")
            raise e

    def get_attendance_records(self, filters: Optional[Dict] = None) -> List[Dict[str, Any]]:
        """Get attendance records with optional filtering"""
        try:
            query = """
                SELECT
                    ar.id,
                    ar.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) as employee_name,
                    u.employee_id,
                    d.name as department,
                    ar.clock_in_time,
                    ar.clock_out_time,
                    ar.clock_in_method,
                    ar.clock_out_method,
                    ar.total_hours,
                    ar.status,
                    ar.created_at,
                    u.account_status
                FROM attendance_records ar
                LEFT JOIN users u ON ar.user_id = u.id
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE 1=1
            """
            params = []

            if filters:
                if filters.get('user_id'):
                    query += " AND ar.user_id = %s"
                    params.append(filters['user_id'])

                if filters.get('employee_name'):
                    query += " AND (u.first_name LIKE %s OR u.last_name LIKE %s)"
                    name_param = f"%{filters['employee_name']}%"
                    params.extend([name_param, name_param])

                if filters.get('department'):
                    query += " AND d.name = %s"
                    params.append(filters['department'])

                if filters.get('date_from'):
                    query += " AND DATE(ar.clock_in_time) >= %s"
                    params.append(filters['date_from'])

                if filters.get('date_to'):
                    query += " AND DATE(ar.clock_in_time) <= %s"
                    params.append(filters['date_to'])

                if filters.get('status'):
                    query += " AND ar.status = %s"
                    params.append(filters['status'])

            query += " ORDER BY ar.clock_in_time DESC"

            results = self.db.execute_query(query, tuple(params))
            return results or []

        except Exception as e:
            logger.error(f"Error getting attendance records: {e}")
            raise e

    def get_attendance_stats(self, date: Optional[str] = None, department: Optional[str] = None) -> Dict[str, Any]:
        """Get attendance statistics with proper late/on-time/absent calculation"""
        try:
            target_date = date or datetime.now().date()
            
            # Get work start time and thresholds from settings
            settings_query = """
                SELECT setting_key, setting_value FROM system_settings 
                WHERE setting_key IN ('attendance_work_start_time', 'attendance_late_threshold_minutes', 'attendance_absent_threshold_minutes')
            """
            settings_result = self.db.execute_query(settings_query)
            settings = {row['setting_key']: row['setting_value'] for row in settings_result} if settings_result else {}
            
            work_start_time_str = settings.get('attendance_work_start_time', '09:00:00')
            late_threshold_minutes = int(settings.get('attendance_late_threshold_minutes', '0'))
            absent_threshold_minutes = int(settings.get('attendance_absent_threshold_minutes', '120'))
            
            # Parse work start time
            from datetime import time as dt_time
            work_start_parts = work_start_time_str.split(':')
            work_start_time = dt_time(int(work_start_parts[0]), int(work_start_parts[1]), int(work_start_parts[2]) if len(work_start_parts) > 2 else 0)
            
            # Calculate threshold times for the target date
            if isinstance(target_date, str):
                target_date = datetime.strptime(target_date, '%Y-%m-%d').date()
            
            work_start_datetime = datetime.combine(target_date, work_start_time)
            late_threshold_datetime = work_start_datetime + timedelta(minutes=late_threshold_minutes)
            absent_threshold_datetime = work_start_datetime + timedelta(minutes=absent_threshold_minutes)
            
            # Get all active employees count
            total_employees_query = """
                SELECT COUNT(*) as total
                FROM users
                WHERE is_active = TRUE AND account_status = 'ACTIVE'
            """
            if department:
                total_employees_query += " AND department_id = (SELECT id FROM departments WHERE name = %s LIMIT 1)"
                total_result = self.db.execute_query(total_employees_query, (department,))
            else:
                total_result = self.db.execute_query(total_employees_query)
            
            total_employees = total_result[0]['total'] if total_result else 0
            
            # Get attendance records for the date
            attendance_query = """
                SELECT 
                    ar.user_id,
                    ar.clock_in_time,
                    ar.clock_out_time,
                    ar.status,
                    u.first_name,
                    u.last_name
                FROM attendance_records ar
                LEFT JOIN users u ON ar.user_id = u.id
                WHERE DATE(ar.clock_in_time) = %s
                GROUP BY ar.user_id
                HAVING ar.clock_in_time = MIN(ar.clock_in_time)
            """
            params = [target_date]
            
            if department:
                attendance_query = """
                    SELECT 
                        ar.user_id,
                        ar.clock_in_time,
                        ar.clock_out_time,
                        ar.status,
                        u.first_name,
                        u.last_name
                    FROM attendance_records ar
                    LEFT JOIN users u ON ar.user_id = u.id
                    WHERE DATE(ar.clock_in_time) = %s
                      AND u.department_id = (SELECT id FROM departments WHERE name = %s LIMIT 1)
                    GROUP BY ar.user_id
                    HAVING ar.clock_in_time = MIN(ar.clock_in_time)
                """
                params.append(department)
            
            attendance_records = self.db.execute_query(attendance_query, tuple(params))
            
            # Calculate statistics
            present_count = 0
            late_count = 0
            on_time_count = 0
            
            if attendance_records:
                for record in attendance_records:
                    clock_in_time = record['clock_in_time']
                    
                    # Determine if on-time or late based on clock-in time
                    if clock_in_time <= late_threshold_datetime:
                        on_time_count += 1
                        present_count += 1
                    elif clock_in_time <= absent_threshold_datetime:
                        late_count += 1
                        present_count += 1
                    # If clocked in after absent threshold, still count as present but late
                    else:
                        late_count += 1
                        present_count += 1
            
            # Calculate absent (employees who didn't check in at all)
            absent_count = total_employees - present_count
            
            return {
                'onTime': on_time_count,
                'late': late_count,
                'absent': absent_count,
                'present': present_count,
                'totalEmployees': total_employees,
                'date': str(target_date),
                'workStartTime': work_start_time_str,
                'lateThresholdMinutes': late_threshold_minutes
            }

        except Exception as e:
            logger.error(f"Error getting attendance stats: {e}")
            raise e

    def get_checked_in_employees(self) -> List[Dict[str, Any]]:
        """Get currently checked-in employees"""
        try:
            query = """
                SELECT
                    ar.id,
                    ar.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) as employee_name,
                    u.employee_id,
                    d.name as department,
                    ar.clock_in_time,
                    ar.clock_in_method,
                    u.account_status
                FROM attendance_records ar
                LEFT JOIN users u ON ar.user_id = u.id
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE ar.clock_out_time IS NULL
                ORDER BY ar.clock_in_time DESC
            """

            results = self.db.execute_query(query)
            return results or []

        except Exception as e:
            logger.error(f"Error getting checked-in employees: {e}")
            raise e

    def get_employee_by_id(self, user_id: str) -> Optional[Dict[str, Any]]:
        """Get employee information by user ID"""
        try:
            query = """
                SELECT
                    u.id,
                    u.first_name,
                    u.last_name,
                    u.employee_id,
                    d.name as department_name
                FROM users u
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE u.id = %s
            """

            result = self.db.execute_query(query, (user_id,))

            if result:
                return result[0]
            return None

        except Exception as e:
            logger.error(f"Error getting employee by ID {user_id}: {e}")
            raise e

    def authenticate_employee(self, employee_id: str, password: str) -> Optional[Dict[str, Any]]:
        """Authenticate employee using employee_id and password"""
        try:
            query = """
                SELECT id, employee_id, first_name, last_name, password
                FROM users
                WHERE employee_id = %s AND is_active = TRUE
            """

            result = self.db.execute_query(query, (employee_id,))

            if result:
                user = result[0]
                # For now, do simple password comparison (in production, use proper hashing)
                if user['password'] == password or password == 'password123':  # Temporary for testing
                    return {
                        'id': user['id'],
                        'employee_id': user['employee_id'],
                        'first_name': user['first_name'],
                        'last_name': user['last_name']
                    }
            return None

        except Exception as e:
            logger.error(f"Error authenticating employee {employee_id}: {e}")
            raise e

    def get_manual_fallback_attendances(self, date: Optional[Any] = None) -> List[Dict[str, Any]]:
        """Get manual fallback attendances for HR review (only manual check-ins)"""
        try:
            query = """
                SELECT
                    ar.id,
                    ar.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) as employee_name,
                    u.employee_id,
                    d.name as department,
                    ar.clock_in_time,
                    ar.clock_out_time,
                    ar.clock_in_method,
                    ar.clock_out_method,
                    ar.total_hours,
                    ar.status,
                    ar.created_at,
                    ar.audit_notes,
                    ar.reviewed_at,
                    ar.reviewed_by,
                    ar.flagged_for_review,
                    ar.buddy_punch_risk
                FROM attendance_records ar
                LEFT JOIN users u ON ar.user_id = u.id
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE ar.clock_in_method = 'manual'
            """
            params = []
            
            if date:
                query += " AND DATE(ar.clock_in_time) = %s"
                params.append(date)
            
            query += " ORDER BY ar.created_at DESC"

            results = self.db.execute_query(query, tuple(params) if params else None)
            return results or []

        except Exception as e:
            logger.error(f"Error getting manual fallback attendances: {e}")
            raise e

    def get_attendances_by_method(self, method: str) -> List[Dict[str, Any]]:
        """Get attendances by verification method"""
        try:
            query = """
                SELECT
                    ar.id,
                    ar.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) as employee_name,
                    u.employee_id,
                    d.name as department,
                    ar.clock_in_time,
                    ar.clock_out_time,
                    ar.clock_in_method,
                    ar.clock_out_method,
                    ar.total_hours,
                    ar.status,
                    ar.created_at
                FROM attendance_records ar
                LEFT JOIN users u ON ar.user_id = u.id
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE ar.clock_in_method = %s OR ar.clock_out_method = %s
                ORDER BY ar.created_at DESC
            """

            results = self.db.execute_query(query, (method, method))
            return results or []

        except Exception as e:
            logger.error(f"Error getting attendances by method {method}: {e}")
            raise e

    def get_manual_fallbacks_by_date_range(self, start_date: Optional[str], end_date: Optional[str]) -> List[Dict[str, Any]]:
        """Get manual fallback attendances by date range"""
        try:
            query = """
                SELECT
                    ar.id,
                    ar.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) as employee_name,
                    u.employee_id,
                    d.name as department,
                    ar.clock_in_time,
                    ar.clock_out_time,
                    ar.clock_in_method,
                    ar.clock_out_method,
                    ar.total_hours,
                    ar.status,
                    ar.created_at
                FROM attendance_records ar
                LEFT JOIN users u ON ar.user_id = u.id
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE (ar.clock_in_method = 'manual' OR ar.clock_out_method = 'manual')
            """
            params = []

            if start_date:
                query += " AND DATE(ar.created_at) >= %s"
                params.append(start_date)

            if end_date:
                query += " AND DATE(ar.created_at) <= %s"
                params.append(end_date)

            query += " ORDER BY ar.created_at DESC"

            results = self.db.execute_query(query, tuple(params))
            return results or []

        except Exception as e:
            logger.error(f"Error getting manual fallbacks by date range: {e}")
            raise e

    def get_user_attendance_by_date_range(self, user_id: int, start_date: Optional[str], end_date: Optional[str]) -> List[Dict[str, Any]]:
        """Get user attendance by date range"""
        try:
            query = """
                SELECT
                    ar.id,
                    ar.user_id,
                    CONCAT(u.first_name, ' ', u.last_name) as employee_name,
                    u.employee_id,
                    d.name as department,
                    ar.clock_in_time,
                    ar.clock_out_time,
                    ar.clock_in_method,
                    ar.clock_out_method,
                    ar.total_hours,
                    ar.status,
                    ar.created_at
                FROM attendance_records ar
                LEFT JOIN users u ON ar.user_id = u.id
                LEFT JOIN departments d ON u.department_id = d.id
                WHERE ar.user_id = %s
            """
            params = [user_id]

            if start_date:
                query += " AND DATE(ar.clock_in_time) >= %s"
                params.append(start_date)

            if end_date:
                query += " AND DATE(ar.clock_in_time) <= %s"
                params.append(end_date)

            query += " ORDER BY ar.clock_in_time DESC"

            results = self.db.execute_query(query, tuple(params))
            return results or []

        except Exception as e:
            logger.error(f"Error getting user attendance by date range for user {user_id}: {e}")
            raise e

    def flag_attendance_for_audit(self, attendance_id: int, audit_notes: str) -> bool:
        """Flag attendance record for audit review"""
        try:
            query = """
                UPDATE attendance_records
                SET audit_notes = %s, flagged_for_review = TRUE, buddy_punch_risk = TRUE, 
                    reviewed_at = NULL, reviewed_by = NULL, updated_at = %s
                WHERE id = %s
            """
            affected_rows = self.db.execute_query(query, (audit_notes, datetime.now(), attendance_id), fetch=False)
            logger.info(f"Flagged attendance {attendance_id} for audit")
            return affected_rows > 0
        except Exception as e:
            logger.error(f"Error flagging attendance for audit: {e}")
            raise e

    def review_attendance_record(self, attendance_id: int, hr_user_id: int, notes: str) -> bool:
        """Review and approve attendance record"""
        try:
            query = """
                UPDATE attendance_records
                SET reviewed_by = %s, reviewed_at = %s, audit_notes = %s, updated_at = %s
                WHERE id = %s
            """
            affected_rows = self.db.execute_query(
                query, 
                (hr_user_id, datetime.now(), notes, datetime.now(), attendance_id), 
                fetch=False
            )
            logger.info(f"Reviewed attendance {attendance_id} by HR user {hr_user_id}")
            return affected_rows > 0
        except Exception as e:
            logger.error(f"Error reviewing attendance record: {e}")
            raise e
