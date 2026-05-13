import { useNavigate, useParams } from 'react-router-dom';
import { ProjectDashboard, Project, Template } from '@/components/shared/ProjectDashboard';
import { FileText, FileSpreadsheet, Presentation } from 'lucide-react';
import { WorkspaceSidebar } from '@/components/layout/WorkspaceSidebar';

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
    { id: 'business-report', name: 'Business Report', description: 'Professional business report with charts.', author: 'COXMOX', category: 'Business' },
    { id: 'meeting-notes', name: 'Meeting Notes', description: 'Structured meeting notes template.', author: 'COXMOX', category: 'Notes' },
    { id: 'resume', name: 'Resume', description: 'Modern resume/CV template.', author: 'Community', category: 'Personal' },
    { id: 'letter', name: 'Letter', description: 'Formal business letter template.', author: 'COXMOX', category: 'Business' },
  ],
  spreadsheets: [
    { id: 'budget', name: 'Budget Planner', description: 'Monthly budget with auto-calculations.', author: 'COXMOX', category: 'Finance' },
    { id: 'invoice', name: 'Invoice', description: 'Professional invoice with totals.', author: 'COXMOX', category: 'Business' },
    { id: 'project-tracker', name: 'Project Tracker', description: 'Task tracking with progress.', author: 'Community', category: 'Work' },
    { id: 'gradebook', name: 'Grade Book', description: 'Student grade tracking and averages.', author: 'Community', category: 'Education' },
  ],
  presentations: [
    { id: 'pitch-deck', name: 'Pitch Deck', description: 'Startup pitch deck with 10 slides.', author: 'COXMOX', category: 'Business' },
    { id: 'lesson-plan', name: 'Lesson Plan', description: 'Educational presentation template.', author: 'Community', category: 'Education' },
    { id: 'product-launch', name: 'Product Launch', description: 'Product launch announcement slides.', author: 'COXMOX', category: 'Marketing' },
    { id: 'portfolio', name: 'Portfolio', description: 'Creative portfolio showcase.', author: 'Community', category: 'Creative' },
  ],
};

interface OfficeHomeProps {
  type: OfficeType;
}

const OfficeHome = ({ type }: OfficeHomeProps) => {
  const navigate = useNavigate();
  const { projectId } = useParams();
  const c = config[type];

  const sidebarItems = demoProjects[type].map(p => ({
    id: p.id,
    name: p.name,
    subtitle: p.status,
    time: p.updatedAt,
  }));

  const newPath =
    type === 'documents' ? '/office/documents/new' :
    type === 'presentations' ? '/office/presentations/new' :
    '/office/spreadsheets/new';
  const createPath = (prompt?: string) =>
    prompt?.trim() ? `${newPath}?prompt=${encodeURIComponent(prompt.trim())}` : newPath;
  const documentTemplateIds = new Set(demoTemplates.documents.map(t => t.id));
  const presentationTemplateIds = new Set(demoTemplates.presentations.map(t => t.id));
  const spreadsheetTemplateIds = new Set(demoTemplates.spreadsheets.map(t => t.id));
  const openPath = (id: string) => {
    if (type === 'documents') return documentTemplateIds.has(id) ? `/office/documents/doc-${Date.now()}?template=${id}` : `/office/documents/${id}`;
    if (type === 'presentations') return presentationTemplateIds.has(id) ? `/office/presentations/pres-${Date.now()}?template=${id}` : `/office/presentations/${id}`;
    return spreadsheetTemplateIds.has(id) ? `/office/spreadsheets/sheet-${Date.now()}?template=${id}` : `/office/spreadsheets/${id}`;
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-background">
      <WorkspaceSidebar
        title={c.title}
        icon={c.icon}
        items={sidebarItems}
        selectedId={projectId}
        onSelectItem={(id) => navigate(openPath(id))}
        onNewItem={() => navigate(createPath())}
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
          onOpenProject={(id) => navigate(openPath(id))}
          onNewProject={(prompt) => navigate(createPath(prompt))}
          promptPlaceholder={c.promptPlaceholder}
        />
      </div>
    </div>
  );
};

export default OfficeHome;
