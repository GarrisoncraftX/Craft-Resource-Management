import { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/components/ui/use-toast';
import { communicationApiService, type NotificationRequest } from '@/services/nodejsbackendapi/communicationApi';
import { Mail, MessageSquare, Bell, Send } from 'lucide-react';

type NotificationType = 'email' | 'sms' | 'push';
type PriorityLevel = 'low' | 'medium' | 'high';

export function CommunicationDashboard() {
  const [emailForm, setEmailForm] = useState({ to: '', subject: '', message: '' });
  const [smsForm, setSmsForm] = useState({ to: '', message: '' });
  const [notificationForm, setNotificationForm] = useState({ type: 'email' as NotificationType, to: '', subject: '', message: '', priority: 'medium' as PriorityLevel });
  const [loading, setLoading] = useState(false);

  const handleSendEmail = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await communicationApiService.sendEmail(emailForm);
      toast({ title: 'Success', description: 'Email sent successfully' });
      setEmailForm({ to: '', subject: '', message: '' });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to send email', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await communicationApiService.sendSMS(smsForm);
      toast({ title: 'Success', description: 'SMS sent successfully' });
      setSmsForm({ to: '', message: '' });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to send SMS', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  const handleSendNotification = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await communicationApiService.sendNotification(notificationForm as NotificationRequest);
      toast({ title: 'Success', description: 'Notification sent successfully' });
      setNotificationForm({ type: 'email', to: '', subject: '', message: '', priority: 'medium' });
    } catch (error) {
      toast({ title: 'Error', description: error instanceof Error ? error.message : 'Failed to send notification', variant: 'destructive' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Communication Center</h1>
        <p className="text-muted-foreground">Send emails, SMS, and notifications</p>
      </div>

      <Tabs defaultValue="email" className="w-full">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="email"><Mail className="w-4 h-4 mr-2" />Email</TabsTrigger>
          <TabsTrigger value="sms"><MessageSquare className="w-4 h-4 mr-2" />SMS</TabsTrigger>
          <TabsTrigger value="notification"><Bell className="w-4 h-4 mr-2" />Notification</TabsTrigger>
        </TabsList>

        <TabsContent value="email">
          <Card>
            <CardHeader>
              <CardTitle>Send Email</CardTitle>
              <CardDescription>Send email to recipients</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendEmail} className="space-y-4">
                <div>
                  <Label htmlFor="email-to">To</Label>
                  <Input id="email-to" type="email" value={emailForm.to} onChange={(e) => setEmailForm({ ...emailForm, to: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="email-subject">Subject</Label>
                  <Input id="email-subject" value={emailForm.subject} onChange={(e) => setEmailForm({ ...emailForm, subject: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="email-message">Message</Label>
                  <Textarea id="email-message" rows={6} value={emailForm.message} onChange={(e) => setEmailForm({ ...emailForm, message: e.target.value })} required />
                </div>
                <Button type="submit" disabled={loading}><Send className="w-4 h-4 mr-2" />Send Email</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="sms">
          <Card>
            <CardHeader>
              <CardTitle>Send SMS</CardTitle>
              <CardDescription>Send SMS to phone numbers</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendSMS} className="space-y-4">
                <div>
                  <Label htmlFor="sms-to">Phone Number</Label>
                  <Input id="sms-to" type="tel" value={smsForm.to} onChange={(e) => setSmsForm({ ...smsForm, to: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="sms-message">Message</Label>
                  <Textarea id="sms-message" rows={4} value={smsForm.message} onChange={(e) => setSmsForm({ ...smsForm, message: e.target.value })} required />
                </div>
                <Button type="submit" disabled={loading}><Send className="w-4 h-4 mr-2" />Send SMS</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="notification">
          <Card>
            <CardHeader>
              <CardTitle>Send Notification</CardTitle>
              <CardDescription>Send multi-channel notifications</CardDescription>
            </CardHeader>
            <CardContent>
              <form onSubmit={handleSendNotification} className="space-y-4">
                <div>
                  <Label htmlFor="notif-type">Type</Label>
                  <Select value={notificationForm.type} onValueChange={(value) => setNotificationForm({ ...notificationForm, type: value as NotificationType })}>
                    <SelectTrigger id="notif-type">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="email">Email</SelectItem>
                      <SelectItem value="sms">SMS</SelectItem>
                      <SelectItem value="push">Push</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="notif-to">To</Label>
                  <Input id="notif-to" value={notificationForm.to} onChange={(e) => setNotificationForm({ ...notificationForm, to: e.target.value })} required />
                </div>
                {notificationForm.type === 'email' && (
                  <div>
                    <Label htmlFor="notif-subject">Subject</Label>
                    <Input id="notif-subject" value={notificationForm.subject} onChange={(e) => setNotificationForm({ ...notificationForm, subject: e.target.value })} />
                  </div>
                )}
                <div>
                  <Label htmlFor="notif-message">Message</Label>
                  <Textarea id="notif-message" rows={4} value={notificationForm.message} onChange={(e) => setNotificationForm({ ...notificationForm, message: e.target.value })} required />
                </div>
                <div>
                  <Label htmlFor="notif-priority">Priority</Label>
                  <Select value={notificationForm.priority} onValueChange={(value) => setNotificationForm({ ...notificationForm, priority: value as PriorityLevel })}>
                    <SelectTrigger id="notif-priority">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="low">Low</SelectItem>
                      <SelectItem value="medium">Medium</SelectItem>
                      <SelectItem value="high">High</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button type="submit" disabled={loading}><Send className="w-4 h-4 mr-2" />Send Notification</Button>
              </form>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
