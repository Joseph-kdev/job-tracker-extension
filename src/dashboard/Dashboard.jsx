import { useEffect, useState } from 'react'

export default function Dashboard() {
  const [jobs, setJobs] = useState([]);

  const [selectedJob, setSelectedJob] = useState(null);

  useEffect(() => {
    // Fetch initial jobs
    chrome.storage.local.get(['jobs'], (result) => {
      if (result.jobs) {
        setJobs(result.jobs);
      }
    });

    // Listen for storage changes to update realtime
    const handleStorageChange = (changes, area) => {
      if (area === 'local' && changes.jobs) {
        setJobs(changes.jobs.newValue || []);
      }
    };
    chrome.storage.onChanged.addListener(handleStorageChange);

    return () => chrome.storage.onChanged.removeListener(handleStorageChange);
  }, []);

  const stats = {
    applied: jobs.filter(j => j.status === 'Applied').length,
    interviewing: jobs.filter(j => j.status === 'Interviewing').length,
    offers: jobs.filter(j => j.status === 'Offer').length,
  };

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-900 text-gray-900 dark:text-gray-100 p-8 font-sans">
      <div className="max-w-7xl mx-auto">
        <header className="mb-8 border-b pb-4 dark:border-gray-700">
          <h1 className="text-3xl font-bold text-blue-600">Job Application Dashboard</h1>
          <p className="text-gray-600 dark:text-gray-400">Track and manage your career opportunities.</p>
        </header>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 border-blue-500">
            <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Applied</h2>
            <p className="text-3xl font-bold">{stats.applied}</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 border-yellow-500">
            <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Interviewing</h2>
            <p className="text-3xl font-bold">{stats.interviewing}</p>
          </div>
          <div className="p-6 bg-white dark:bg-gray-800 rounded-lg shadow border-l-4 border-green-500">
            <h2 className="text-sm font-semibold uppercase text-gray-500 dark:text-gray-400 mb-1">Offers</h2>
            <p className="text-3xl font-bold">{stats.offers}</p>
          </div>
        </div>

        <div className="bg-white dark:bg-gray-800 rounded-lg shadow overflow-hidden">
          <div className="p-6 border-b dark:border-gray-700">
            <h2 className="text-xl font-bold">Recent Applications</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50 dark:bg-gray-700 text-sm uppercase text-gray-500 dark:text-gray-300">
                  <th className="p-4 font-semibold">Date</th>
                  <th className="p-4 font-semibold">Company</th>
                  <th className="p-4 font-semibold">Role</th>
                  <th className="p-4 font-semibold">Status</th>
                  <th className="p-4 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-200 dark:divide-gray-700">
                {jobs.length === 0 ? (
                  <tr>
                    <td colSpan="5" className="p-8 text-center text-gray-500">
                      No applications saved yet. Use the extension side panel to add one!
                    </td>
                  </tr>
                ) : (
                  jobs.map((job) => (
                    <tr key={job.id} className="hover:bg-gray-50 dark:hover:bg-gray-750">
                      <td className="p-4 text-sm text-gray-600 dark:text-gray-400">{job.date}</td>
                      <td className="p-4 font-medium">{job.company}</td>
                      <td className="p-4">
                        <a href={job.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                          {job.title}
                        </a>
                      </td>
                      <td className="p-4">
                        <span className={`px-2 py-1 text-xs font-semibold rounded-full 
                          ${job.status === 'Applied' ? 'bg-blue-100 text-blue-800' : 
                            job.status === 'Interviewing' ? 'bg-yellow-100 text-yellow-800' : 
                            job.status === 'Offer' ? 'bg-green-100 text-green-800' : 
                            job.status === 'Rejected' ? 'bg-red-100 text-red-800' : 'bg-gray-100 text-gray-800'
                          }`}>
                          {job.status}
                        </span>
                      </td>
                      <td className="p-4 flex gap-2">
                        <button 
                             className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                             onClick={() => setSelectedJob(job)}
                        >
                          View
                        </button>
                        <button 
                          className="text-red-500 hover:text-red-700 text-sm"
                          onClick={() => {
                            const newJobs = jobs.filter(j => j.id !== job.id);
                            setJobs(newJobs);
                            chrome.storage.local.set({ jobs: newJobs });
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {selectedJob && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl max-w-2xl w-full max-h-[80vh] flex flex-col">
            <div className="p-6 border-b dark:border-gray-700 flex justify-between items-start">
              <div>
                <h3 className="text-xl font-bold">{selectedJob.title}</h3>
                <p className="text-sm text-gray-600 dark:text-gray-400">{selectedJob.company} • {selectedJob.date}</p>
              </div>
              <button onClick={() => setSelectedJob(null)} className="text-gray-500 hover:text-gray-700 dark:hover:text-gray-300">
                ✕
              </button>
            </div>
            
            <div className="p-6 overflow-y-auto flex-1">
              <div className="prose dark:prose-invert max-w-none whitespace-pre-wrap text-sm">
                {selectedJob.description || 'No description available for this job.'}
              </div>
              
              <div className="mt-6 pt-6 border-t dark:border-gray-700">
                 <a href={selectedJob.url} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">
                    Visit Original Job Post
                 </a>
              </div>
            </div>
            
            <div className="p-4 border-t dark:border-gray-700 bg-gray-50 dark:bg-gray-900 rounded-b-lg flex justify-end">
              <button 
                onClick={() => setSelectedJob(null)}
                className="px-4 py-2 bg-gray-200 dark:bg-gray-700 rounded hover:bg-gray-300 dark:hover:bg-gray-600 transition-colors"
               >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
