import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar';
import OfficeEditor from './OfficeEditor';

type OfficeType = 'documents' | 'spreadsheets' | 'presentations';

const config: Record<OfficeType, { icon: any; title: string; mode: string; promptPlaceholder: string; subtitle: string }> = {
  documents: { icon: FileText, title: 'Documents', mode: 'document', promptPlaceholder: 'Describe the document you want to create...', subtitle: 'Create rich text documents with AI' },
  spreadsheets: { icon: FileSpreadsheet, title: 'Spreadsheets', mode: 'spreadsheet', promptPlaceholder: 'Describe the spreadsheet you want to create...', subtitle: 'Build data tables with formulas and charts' },
  presentations: { icon: Presentation, title: 'Presentations', mode: 'presentation', promptPlaceholder: 'Describe the presentation you want to create...', subtitle: 'Design professional slide decks' },
};

const demoProjects: Record<OfficeType, Project[]> = {
  documents: [
    { id: 'doc-1', name: 'Q4 Business Report', description: 'Annual review with executive summary and financial highlights.', updatedAt: '2 hours ago', status: 'active' },
    { id: 'doc-2', name: 'Meeting Notes - Dec', description: 'Notes from the December all-hands meeting.', updatedAt: '1 day ago', status: 'draft' },
    { id: 'doc-3', name: 'Project Proposal', description: 'Proposal for the new mobile app initiative.', updatedAt: '3 days ago', status: 'active' },
  ],
  spreadsheets: [
    { id: 'sheet-1', name: 'Sales Dashboard 2024', description: 'Revenue tracking with quarterly charts.', updatedAt: '5 hours ago', status: 'active' },
    { id: 'sheet-2', name: 'Budget Tracker', description: 'Monthly budget allocation and spending tracker.', updatedAt: '2 days ago', status: 'active' },
    { id: 'sheet-3', name: 'Inventory List', description: 'Product inventory with stock levels.', updatedAt: '1 week ago', status: 'draft' },
  ],
  presentations: [
    { id: 'pres-1', name: 'Product Pitch Deck', description: 'Investor pitch with product demo slides.', updatedAt: '1 day ago', status: 'deployed' },
    { id: 'pres-2', name: 'Company Overview', description: 'Company introduction and culture slides.', updatedAt: '4 days ago', status: 'active' },
    { id: 'pres-3', name: 'Team Update Q4', description: 'Quarterly team performance review.', updatedAt: '1 week ago', status: 'draft' },
  ],
};

const demoTemplates: Record<OfficeType, Template[]> = {
  documents: [
    { id: 'dt-1', name: 'Business Report', description: 'Professional business report with charts.', author: 'COXMOX', category: 'Business' },
    { id: 'dt-2', name: 'Meeting Notes', description: 'Structured meeting notes template.', author: 'COXMOX', category: 'Notes' },
    { id: 'dt-3', name: 'Resume', description: 'Modern resume/CV template.', author: 'Community', category: 'Personal' },
    { id: 'dt-4', name: 'Letter', description: 'Formal business letter template.', author: 'COXMOX', category: 'Business' },
  ],
  spreadsheets: [
    { id: 'st-1', name: 'Budget Planner', description: 'Monthly budget with auto-calculations.', author: 'COXMOX', category: 'Finance' },
    { id: 'st-2', name: 'Invoice', description: 'Professional invoice with totals.', author: 'COXMOX', category: 'Business' },
    { id: 'st-3', name: 'Project Tracker', description: 'Task tracking with progress bars.', author: 'Community', category: 'Project' },
    { id: 'st-4', name: 'Grade Book', description: 'Student grade tracking and averages.', author: 'Community', category: 'Education' },
  ],
  presentations: [
    { id: 'pt-1', name: 'Pitch Deck', description: 'Startup pitch deck with 10 slides.', author: 'COXMOX', category: 'Business' },
    { id: 'pt-2', name: 'Lesson Plan', description: 'Educational presentation template.', author: 'Community', category: 'Education' },
    { id: 'pt-3', name: 'Product Launch', description: 'Product launch announcement slides.', author: 'COXMOX', category: 'Marketing' },
    { id: 'pt-4', name: 'Portfolio', description: 'Creative portfolio showcase.', author: 'Community', category: 'Creative' },
  ],
};

interface OfficeHomeProps {
  type: OfficeType;
}

const OfficeHome = ({ type }: OfficeHomeProps) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const c = config[type];

  if (projectId) {
    return (
      <div className="flex h-screen w-full overflow-hidden bg-background">
        <OfficeEditor />
      </div>
    );
  }

  const sidebarItems = demoProjects[type].map(p => ({
    id: p.id,
    name: p.name,
    subtitle: p.status,
    time: p.updatedAt,
  }));

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <WorkspaceSidebar
        title={c.title}
        icon={c.icon}
        items={sidebarItems}
        selectedId={projectId}
        onSelectItem={(id) => navigate(`/office/${type}/${id}`)}
        onNewItem={() => navigate(`/office/new?mode=${c.mode}`)}
        newItemLabel={`New ${c.title.slice(0, -1)}`}
        searchPlaceholder={`Search ${type}...`}
        basePath={`/office/${type}`}
      />
      <div className="flex-1 flex flex-col min-w-0 overflow-hidden">
        <ProjectDashboard
          title={c.title}
          subtitle={c.subtitle}
          icon={<c.icon className="w-4 h-4" />}
          projects={demoProjects[type]}
          templates={demoTemplates[type]}
          onOpenProject={(id) => navigate(`/office/${type}/${id}?mode=${c.mode}`)}
          onNewProject={() => navigate(`/office/new?mode=${c.mode}`)}
          promptPlaceholder={c.promptPlaceholder}
        />
      </div>
    </div>
  );
};

export default OfficeHome;
