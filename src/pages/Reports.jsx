const Reports = () => {
  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Reports</h1>
      
      <div className="grid grid-cols-2 gap-6">
        <div className="card">
          <h3 className="font-semibold mb-4">Performance Overview</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            Chart Placeholder
          </div>
        </div>
        
        <div className="card">
          <h3 className="font-semibold mb-4">Submission Analytics</h3>
          <div className="h-64 bg-gray-100 rounded flex items-center justify-center">
            Chart Placeholder
          </div>
        </div>
        
        <div className="card col-span-2">
          <h3 className="font-semibold mb-4">Recent Activity</h3>
          <div className="space-y-2">
            {[1,2,3].map(i => (
              <div key={i} className="p-3 bg-gray-50 rounded-lg">
                Activity Item {i}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

export default Reports;
