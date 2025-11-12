export default function LoadingPatients() {
  return (
    <div className="p-6 space-y-8">
      <section>
        <div className="h-7 w-40 bg-gray-200 rounded animate-pulse mb-4" />
        <div className="overflow-x-auto">
          <table className="min-w-full border-collapse border border-gray-300">
            <thead className="bg-gray-100">
              <tr>
                <th className="border border-gray-300 px-4 py-2 text-center">Name</th>
                <th className="border border-gray-300 px-4 py-2 text-center">Date of Birth</th>
              </tr>
            </thead>
            <tbody>
              {Array.from({ length: 5 }).map((_, i) => (
                <tr key={i} className="hover:bg-gray-50">
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-4 w-48 bg-gray-200 rounded animate-pulse mx-auto" />
                  </td>
                  <td className="border border-gray-300 px-4 py-2">
                    <div className="h-4 w-32 bg-gray-200 rounded animate-pulse mx-auto" />
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}
