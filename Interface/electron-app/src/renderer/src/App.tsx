// App.tsx
import JobTable from './JobTable';
import { JobsProvider } from './JobsContext';

export default function App() {
  return (
    <JobsProvider>
      <div className="w-screen h-screen p-4">
        <JobTable />
      </div>
    </JobsProvider>
  );
}
