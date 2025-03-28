const Assignments = () => {
  const assignments = [
    { id: 1, title: 'React Basics', due: '2024-02-20', status: 'pending' },
    { id: 2, title: 'JavaScript Arrays', due: '2024-02-22', status: 'completed' },
    { id: 3, title: 'CSS Layouts', due: '2024-02-25', status: 'pending' }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Assignments</h1>
        <button className="btn-primary">New Assignment</button>
      </div>
      
      <div className="grid gap-4">
        {assignments.map(assignment => (
          <div key={assignment.id} className="card flex justify-between items-center">
            <div>
              <h3 className="font-semibold">{assignment.title}</h3>
              <p className="text-sm text-gray-500">Due: {assignment.due}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-sm ${
              assignment.status === 'completed' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'
            }`}>
              {assignment.status}
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Assignments;
