import cv2
import numpy as np
import base64
import hashlib
import torch
import torch.nn as nn
from typing import Optional, Dict, Any, Tuple
from sklearn.metrics.pairwise import cosine_similarity
from src.utils.logger import logger
from src.config.app import Config
import os

class MobileFaceNet(nn.Module):
    # Placeholder for MobileFaceNet architecture
    def __init__(self):
        super(MobileFaceNet, self).__init__()
        # Define a simple model or load pretrained weights here
        # For demonstration, a dummy linear layer
        self.fc = nn.Linear(128*128, 128)
    
    def forward(self, x):
        x = x.view(x.size(0), -1)
        x = self.fc(x)
        x = nn.functional.normalize(x)
        return x

class BiometricService:
    def __init__(self):
        self.face_detector = None
        self.face_recognition_threshold = Config.FACE_RECOGNITION_THRESHOLD
        self.device = torch.device('cuda' if torch.cuda.is_available() else 'cpu')
        self._initialize_face_detection()
        self._initialize_face_recognition_model()
    
    def _initialize_face_detection(self):
        """Initialize face detection models using OpenCV DNN with lightweight model"""
        try:
            modelFile = os.path.join('models', 'res10_300x300_ssd_iter_140000_fp16.caffemodel')
            configFile = os.path.join('models', 'deploy.prototxt')
            if not os.path.exists(modelFile) or not os.path.exists(configFile):
                raise FileNotFoundError("Lightweight face detection model files not found in 'models/' directory.")
            self.face_detector = cv2.dnn.readNetFromCaffe(configFile, modelFile)
            logger.info("✅ Lightweight DNN face detection model loaded successfully")
        except Exception as e:
            logger.error(f"❌ Error loading lightweight face detection model: {e}")
            self.face_detector = None
    
    def _initialize_face_recognition_model(self):
        """Initialize lightweight face recognition model (MobileFaceNet)"""
        try:
            self.face_recognition_model = MobileFaceNet().to(self.device)
            # Load pretrained weights if available
            weights_path = os.path.join('models', 'mobilefacenet.pth')
            if os.path.exists(weights_path):
                self.face_recognition_model.load_state_dict(torch.load(weights_path, map_location=self.device))
                logger.info("✅ MobileFaceNet model loaded successfully")
            else:
                logger.warning("⚠️ MobileFaceNet weights not found, using untrained model")
            self.face_recognition_model.eval()
        except Exception as e:
            logger.error(f"❌ Error loading face recognition model: {e}")
            self.face_recognition_model = None
    
    def process_face_image(self, base64_image: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """Process base64 face image and extract features using lightweight model"""
        try:
            # Decode base64 image
            if ',' in base64_image:
                image_data = base64.b64decode(base64_image.split(',')[1])
            else:
                image_data = base64.b64decode(base64_image)
            
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return None, "Invalid image data"
            
            if self.face_detector is None or self.face_recognition_model is None:
                # Fallback: create a simple hash of the image
                image_hash = hashlib.sha256(image_data).hexdigest()
                return {
                    'template_hash': image_hash,
                    'template_data': base64_image,
                    'method': 'hash'
                }, None
            
            # Prepare input blob for DNN face detector
            h, w = image.shape[:2]
            blob = cv2.dnn.blobFromImage(cv2.resize(image, (300, 300)), 1.0,
                                         (300, 300), (104.0, 177.0, 123.0))
            self.face_detector.setInput(blob)
            detections = self.face_detector.forward()
            
            if detections.shape[2] == 0:
                return None, "No face detected in image"
            
            # Find the detection with highest confidence
            max_confidence = 0
            max_index = 0
            for i in range(detections.shape[2]):
                confidence = detections[0, 0, i, 2]
                if confidence > max_confidence:
                    max_confidence = confidence
                    max_index = i
            
            if max_confidence < 0.5:
                return None, "No confident face detected"
            
            box = detections[0, 0, max_index, 3:7] * np.array([w, h, w, h])
            (x1, y1, x2, y2) = box.astype("int")
            x1, y1 = max(0, x1), max(0, y1)
            x2, y2 = min(w - 1, x2), min(h - 1, y2)
            
            face_roi = image[y1:y2, x1:x2]
            face_roi = cv2.cvtColor(face_roi, cv2.COLOR_BGR2GRAY)
            face_roi = cv2.resize(face_roi, (128, 128))
            face_tensor = torch.tensor(face_roi, dtype=torch.float32).unsqueeze(0).unsqueeze(0).to(self.device)
            
            with torch.no_grad():
                features = self.face_recognition_model(face_tensor)
            
            features_np = features.cpu().numpy().flatten()
            features_np = features_np / np.linalg.norm(features_np)
            
            template_hash = hashlib.sha256(features_np.tobytes()).hexdigest()
            template_data = base64.b64encode(features_np.tobytes()).decode('utf-8')
            
            return {
                'template_hash': template_hash,
                'template_data': template_data,
                'method': 'lightweight_dnn',
                'face_coordinates': {'x': int(x1), 'y': int(y1), 'width': int(x2 - x1), 'height': int(y2 - y1)}
            }, None
            
        except Exception as e:
            logger.error(f"Error processing face image: {e}")
            return None, f"Error processing face image: {str(e)}"
    
    def compare_face_templates(self, template1_data: str, template2_data: str) -> float:
        """Compare two face templates and return similarity score"""
        try:
            features1 = np.frombuffer(base64.b64decode(template1_data), dtype=np.float32)
            features2 = np.frombuffer(base64.b64decode(template2_data), dtype=np.float32)
            similarity = cosine_similarity([features1], [features2])[0][0]
            return float(similarity)
        except Exception as e:
            logger.error(f"Error comparing face templates: {e}")
            return 0.0
    
    
    def process_face_image(self, base64_image: str) -> Tuple[Optional[Dict[str, Any]], Optional[str]]:
        """Process base64 face image and extract features"""
        try:
            # Decode base64 image
            if ',' in base64_image:
                image_data = base64.b64decode(base64_image.split(',')[1])
            else:
                image_data = base64.b64decode(base64_image)
            
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return None, "Invalid image data"
            
            # Convert to grayscale for face detection
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            
            # Detect faces
            if self.face_detector is None:
                # Fallback: create a simple hash of the image
                image_hash = hashlib.sha256(image_data).hexdigest()
                return {
                    'template_hash': image_hash,
                    'template_data': base64_image,
                    'method': 'hash'
                }, None
            
            faces = self.face_detector.detectMultiScale(gray, 1.1, 4)
            
            if len(faces) == 0:
                return None, "No face detected in image"
            
            if len(faces) > 1:
                return None, "Multiple faces detected, please ensure only one face is visible"
            
            # Get the largest face
            (x, y, w, h) = faces[0]
            face_roi = gray[y:y+h, x:x+w]
            
            # Resize face to standard size
            face_roi = cv2.resize(face_roi, (128, 128))
            
            # Create a simple feature vector (in production, use proper face encoding)
            face_features = face_roi.flatten().astype(np.float32)
            face_features = face_features / np.linalg.norm(face_features)  # Normalize
            
            # Create template hash
            template_hash = hashlib.sha256(face_features.tobytes()).hexdigest()
            
            return {
                'template_hash': template_hash,
                'template_data': base64.b64encode(face_features.tobytes()).decode('utf-8'),
                'method': 'opencv',
                'face_coordinates': {'x': int(x), 'y': int(y), 'width': int(w), 'height': int(h)}
            }, None
            
        except Exception as e:
            logger.error(f"Error processing face image: {e}")
            return None, f"Error processing face image: {str(e)}"
    
    def compare_face_templates(self, template1_data: str, template2_data: str) -> float:
        """Compare two face templates and return similarity score"""
        try:
            # Decode templates
            features1 = np.frombuffer(base64.b64decode(template1_data), dtype=np.float32)
            features2 = np.frombuffer(base64.b64decode(template2_data), dtype=np.float32)
            
            # Calculate cosine similarity
            similarity = cosine_similarity([features1], [features2])[0][0]
            
            return float(similarity)
        except Exception as e:
            logger.error(f"Error comparing face templates: {e}")
            return 0.0
    
    def process_fingerprint_data(self, fingerprint_data: str) -> Dict[str, str]:
        """Process fingerprint data (mock implementation)"""
        try:
            # Mock fingerprint processing
            template_hash = hashlib.sha256(fingerprint_data.encode()).hexdigest()
            template_data = base64.b64encode(fingerprint_data.encode()).decode('utf-8')
            
            return {
                'template_hash': template_hash,
                'template_data': template_data,
                'method': 'mock_fingerprint'
            }
        except Exception as e:
            logger.error(f"Error processing fingerprint data: {e}")
            raise e
    
    def process_card_data(self, card_data: str) -> Dict[str, str]:
        """Process card data (mock implementation)"""
        try:
            # Mock card processing
            template_hash = hashlib.sha256(card_data.encode()).hexdigest()
            template_data = base64.b64encode(card_data.encode()).decode('utf-8')
            
            return {
                'template_hash': template_hash,
                'template_data': template_data,
                'method': 'mock_card'
            }
        except Exception as e:
            logger.error(f"Error processing card data: {e}")
            raise e
    
    def verify_biometric(self, live_template: str, stored_template: str, biometric_type: str) -> Dict[str, Any]:
        """Verify biometric data against stored template (1:1 verification)"""
        try:
            if biometric_type == 'face':
                similarity = self.compare_face_templates(live_template, stored_template)
                is_match = similarity >= self.face_recognition_threshold
            else:
                # Simple comparison for mock fingerprint/card
                is_match = live_template == stored_template
                similarity = 1.0 if is_match else 0.0
            
            return {
                'is_match': is_match,
                'similarity_score': similarity,
                'threshold': self.face_recognition_threshold if biometric_type == 'face' else 1.0
            }
        except Exception as e:
            logger.error(f"Error verifying biometric: {e}")
            raise e
    
    def identify_from_templates(self, live_template: str, stored_templates: list, biometric_type: str) -> Optional[Dict[str, Any]]:
        """Identify user from biometric data (1:N identification)"""
        try:
            best_match = None
            best_similarity = 0.0
            threshold = self.face_recognition_threshold if biometric_type == 'face' else 1.0
            
            for user_id, stored_template, first_name, last_name, employee_id in stored_templates:
                if biometric_type == 'face':
                    similarity = self.compare_face_templates(live_template, stored_template)
                else:
                    similarity = 1.0 if live_template == stored_template else 0.0
                
                if similarity >= threshold and similarity > best_similarity:
                    best_similarity = similarity
                    best_match = {
                        'user_id': user_id,
                        'first_name': first_name,
                        'last_name': last_name,
                        'employee_id': employee_id,
                        'similarity_score': similarity
                    }
            
            return best_match
        except Exception as e:
            logger.error(f"Error identifying from templates: {e}")
            raise e
    
    def validate_image_quality(self, base64_image: str) -> Tuple[bool, Optional[str]]:
        """Validate image quality for biometric processing"""
        try:
            # Decode base64 image
            if ',' in base64_image:
                image_data = base64.b64decode(base64_image.split(',')[1])
            else:
                image_data = base64.b64decode(base64_image)
            
            nparr = np.frombuffer(image_data, np.uint8)
            image = cv2.imdecode(nparr, cv2.IMREAD_COLOR)
            
            if image is None:
                return False, "Invalid image format"
            
            # Check image dimensions
            height, width = image.shape[:2]
            if width < 100 or height < 100:
                return False, "Image too small (minimum 100x100 pixels)"
            
            if width > 2000 or height > 2000:
                return False, "Image too large (maximum 2000x2000 pixels)"
            
            # Check image brightness
            gray = cv2.cvtColor(image, cv2.COLOR_BGR2GRAY)
            mean_brightness = np.mean(gray)
            
            if mean_brightness < 50:
                return False, "Image too dark"
            
            if mean_brightness > 200:
                return False, "Image too bright"
            
            # Check image blur (using Laplacian variance)
            laplacian_var = cv2.Laplacian(gray, cv2.CV_64F).var()
            if laplacian_var < 100:
                return False, "Image too blurry"
            
            return True, None
            
        except Exception as e:
            logger.error(f"Error validating image quality: {e}")
            return False, f"Error validating image: {str(e)}"
