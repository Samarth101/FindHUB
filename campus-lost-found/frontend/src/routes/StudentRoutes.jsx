import { Routes, Route } from 'react-router-dom';
import RequireAuth    from '../auth/RequireAuth';
import StudentLayout  from '../components/layout/StudentLayout';

/* ── Student Pages ── */
import Dashboard     from '../pages/student/Dashboard';
import ReportLost    from '../pages/student/ReportLost';
import ReportFound   from '../pages/student/ReportFound';
import MyReports     from '../pages/student/MyReports';
import Matches       from '../pages/student/Matches';
import VerifyClaim   from '../pages/student/VerifyClaim';
import Community     from '../pages/student/Community';
import ThreadView    from '../pages/student/ThreadView';
import Chat          from '../pages/student/Chat';
import Handover      from '../pages/student/Handover';
import Notifications from '../pages/student/Notifications';
import Profile       from '../pages/student/Profile';

export default function StudentRoutes() {
  return (
    <RequireAuth role="student">
      <StudentLayout>
        <Routes>
          <Route index              element={<Dashboard />} />
          <Route path="report-lost" element={<ReportLost />} />
          <Route path="report-found" element={<ReportFound />} />
          <Route path="my-reports"  element={<MyReports />} />
          <Route path="matches"     element={<Matches />} />
          <Route path="verify/:id"  element={<VerifyClaim />} />
          <Route path="community"   element={<Community />} />
          <Route path="community/:id" element={<ThreadView />} />
          <Route path="chat"        element={<Chat />} />
          <Route path="handover"    element={<Handover />} />
          <Route path="notifications" element={<Notifications />} />
          <Route path="profile"     element={<Profile />} />
        </Routes>
      </StudentLayout>
    </RequireAuth>
  );
}
