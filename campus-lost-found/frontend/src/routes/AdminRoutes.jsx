import { Routes, Route } from 'react-router-dom';
import RequireAuth   from '../auth/RequireAuth';
import AdminLayout   from '../components/layout/AdminLayout';

/* ── Admin Pages ── */
import Dashboard   from '../pages/admin/Dashboard';
import FoundIntake from '../pages/admin/FoundIntake';
import FoundItems  from '../pages/admin/FoundItems';
import LostReports from '../pages/admin/LostReports';
import Matches     from '../pages/admin/Matches';
import Claims      from '../pages/admin/Claims';
import Handovers   from '../pages/admin/Handovers';
import Users       from '../pages/admin/Users';
import Moderation  from '../pages/admin/Moderation';
import ChatLogs    from '../pages/admin/ChatLogs';
import Analytics   from '../pages/admin/Analytics';
import AuditLogs   from '../pages/admin/AuditLogs';

export default function AdminRoutes() {
  return (
    <RequireAuth role="admin">
      <AdminLayout>
        <Routes>
          <Route index               element={<Dashboard />} />
          <Route path="found-intake" element={<FoundIntake />} />
          <Route path="found-items"  element={<FoundItems />} />
          <Route path="lost-reports" element={<LostReports />} />
          <Route path="matches"      element={<Matches />} />
          <Route path="claims"       element={<Claims />} />
          <Route path="handovers"    element={<Handovers />} />
          <Route path="users"        element={<Users />} />
          <Route path="moderation"   element={<Moderation />} />
          <Route path="chat-logs"    element={<ChatLogs />} />
          <Route path="analytics"    element={<Analytics />} />
          <Route path="audit-logs"   element={<AuditLogs />} />
        </Routes>
      </AdminLayout>
    </RequireAuth>
  );
}
