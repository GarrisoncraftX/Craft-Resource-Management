import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Plus, FileText } from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface LegalOpinion {
  id: string;
  subject: string;
  author: string;
  date: string;
  category: string;
  status: string;
}

export const LegalOpinions: React.FC = () => {
  const [opinions] = useState<LegalOpinion[]>([
    { id: 'OP-001', subject: 'Data Retention Policy', author: 'Legal Dept', date: '2024-01-09', category: 'Privacy', status: 'Published' },
    { id: 'OP-002', subject: 'Vendor Liability Clause', author: 'External Counsel', date: '2024-01-03', category: 'Contracts', status: 'Published' },
    { id: 'OP-003', subject: 'Employment Termination Guidelines', author: 'Legal Dept', date: '2024-01-15', category: 'Employment', status: 'Draft' },
    { id: 'OP-004', subject: 'Intellectual Property Rights', author: 'External Counsel', date: '2024-01-20', category: 'IP', status: 'Published' }
  ]);

  const opinionsByCategory = [
    { category: 'Privacy', count: opinions.filter(o => o.category === 'Privacy').length },
    { category: 'Contracts', count: opinions.filter(o => o.category === 'Contracts').length },
    { category: 'Employment', count: opinions.filter(o => o.category === 'Employment').length },
    { category: 'IP', count: opinions.filter(o => o.category === 'IP').length }
  ];

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Opinions by Category</CardTitle>
          <CardDescription>Distribution of legal opinions</CardDescription>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={250}>
            <BarChart data={opinionsByCategory}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="category" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="count" fill="#3b82f6" />
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <div className="flex justify-between items-center">
            <div>
              <CardTitle>Legal Opinions</CardTitle>
              <CardDescription>Written opinions and guidance</CardDescription>
            </div>
            <Button>
              <Plus className="h-4 w-4 mr-2" />
              New Opinion
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {opinions.map((o) => (
              <div key={o.id} className="p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                <div className="flex justify-between items-start">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                      <span className="font-medium">{o.subject}</span>
                      <Badge variant={o.status === 'Published' ? 'default' : 'secondary'}>
                        {o.status}
                      </Badge>
                    </div>
                    <div className="text-sm text-muted-foreground">
                      By {o.author} • {new Date(o.date).toLocaleDateString()} • {o.category}
                    </div>
                  </div>
                  <Button size="sm" variant="outline">
                    View
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default LegalOpinions;
