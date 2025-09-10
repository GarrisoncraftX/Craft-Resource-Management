import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';

export const LegalOpinions: React.FC = () => {
  const opinions = [
    { id: 'OP-001', subject: 'Data Retention Policy', author: 'Legal Dept', date: '2024-01-09' },
    { id: 'OP-002', subject: 'Vendor Liability Clause', author: 'External Counsel', date: '2024-01-03' },
  ];
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Legal Opinions</CardTitle>
          <CardDescription>Written opinions and guidance</CardDescription>
        </CardHeader>
        <CardContent>
          <ul className="space-y-2">
            {opinions.map((o) => (
              <li key={o.id} className="p-3 border rounded-md">
                <div className="font-medium">{o.subject}</div>
                <div className="text-sm text-muted-foreground">By {o.author} • {o.date}</div>
              </li>
            ))}
          </ul>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalOpinions;
