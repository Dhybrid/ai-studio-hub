import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { FileSpreadsheet } from 'lucide-react';
import OfficeEditor from './OfficeEditor';

const officeProjects: Project[] = [
  { id: 'off-1', name: 'Q4 Business Report', description: 'Quarterly business performance analysis with charts and insights.', updatedAt: '1 day ago', status: 'active' as const, thumbnail: 'https://images.unsplash.com/photo-1460925895917-afdab827c52f?w=400&h=250&fit=crop' },
  { id: 'off-2', name: 'Product Pitch Deck', description: 'Investor pitch presentation with 15 slides and data visualizations.', updatedAt: '3 days ago', status: 'deployed' as const, thumbnail: 'https://images.unsplash.com/photo-1542744173-8e7e53415bb0?w=400&h=250&fit=crop' },
  { id: 'off-3', name: 'Market Analysis', description: 'Competitive landscape analysis with data tables and trend charts.', updatedAt: '1 week ago', status: 'draft' as const, thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop' },
];

const officeTemplates: Template[] = [
  { id: 'otmpl-1', name: 'Pitch Deck', description: 'Professional investor pitch with charts and market analysis.', author: 'COXMOX Team', category: 'Presentation', thumbnail: 'https://images.unsplash.com/photo-1559136555-9303baea8ebd?w=400&h=250&fit=crop' },
  { id: 'otmpl-2', name: 'Financial Report', description: 'Quarterly financial report with P&L, balance sheet, and forecasts.', author: 'Community', category: 'Report', thumbnail: 'https://images.unsplash.com/photo-1554224155-6726b3ff858f?w=400&h=250&fit=crop' },
  { id: 'otmpl-3', name: 'Data Dashboard', description: 'Interactive data dashboard with filters and dynamic charts.', author: 'COXMOX Team', category: 'Analysis', thumbnail: 'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=400&h=250&fit=crop' },
];

const OfficeDashboard = () => {
  const navigate = useNavigate();
  const { projectId } = useParams();

  if (projectId) {
    return <OfficeEditor />;
  }

  return (
    <ProjectDashboard
      title="Office"
      subtitle="Create presentations, reports, and data analysis with AI"
      icon={<FileSpreadsheet className="w-4 h-4" />}
      projects={officeProjects}
      templates={officeTemplates}
      onOpenProject={(id) => navigate(`/office/${id}`)}
      onNewProject={() => navigate('/office/new')}
      promptPlaceholder="Describe the document or presentation you want to create..."
    />
  );
};

export default OfficeDashboard;
