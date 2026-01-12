import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog';
import { KeyRound, Copy, Check } from 'lucide-react';
import { authApiService } from '@/services/nodejsbackendapi/authApi';
import { toast } from 'sonner';

interface AdminResetPasswordDialogProps {
  userId: string;
  userName: string;
}

export const AdminResetPasswordDialog: React.FC<AdminResetPasswordDialogProps> = ({ userId, userName }) => {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [newPassword, setNewPassword] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  const handleResetPassword = async () => {
    setLoading(true);
    try {
      const response = await authApiService.adminResetPassword({ userId });
      setNewPassword(response.defaultPassword);
      toast.success('Password reset successfully');
    } catch (error) {
      toast.error(error.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyPassword = () => {
    if (newPassword) {
      navigator.clipboard.writeText(newPassword);
      setCopied(true);
      toast.success('Password copied to clipboard');
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleClose = () => {
    setOpen(false);
    setNewPassword(null);
    setCopied(false);
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        <Button variant="ghost" size="sm" title="Reset Password">
          <KeyRound className="h-4 w-4" />
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Reset User Password</DialogTitle>
          <DialogDescription>
            Reset password for {userName} to the default password.
          </DialogDescription>
        </DialogHeader>
        
        {!newPassword ? (
          <div className="py-4">
            <p className="text-sm text-muted-foreground">
              This will reset the user's password to the default password: <strong>CRMSemp123!</strong>
            </p>
            <p className="text-sm text-muted-foreground mt-2">
              The user will be required to change their password on next login.
            </p>
          </div>
        ) : (
          <div className="py-4 space-y-4">
            <div className="p-4 bg-green-50 border border-green-200 rounded-md">
              <p className="text-sm font-medium text-green-900 mb-2">Password Reset Successful</p>
              <div className="flex items-center gap-2">
                <code className="flex-1 p-2 bg-white border rounded text-sm font-mono">
                  {newPassword}
                </code>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCopyPassword}
                  className="shrink-0"
                >
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>
            <p className="text-sm text-muted-foreground">
              Please share this password with the user securely.
            </p>
          </div>
        )}

        <DialogFooter>
          {!newPassword ? (
            <>
              <Button variant="outline" onClick={handleClose}>
                Cancel
              </Button>
              <Button onClick={handleResetPassword} disabled={loading}>
                {loading ? 'Resetting...' : 'Reset Password'}
              </Button>
            </>
          ) : (
            <Button onClick={handleClose}>
              Close
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
};
