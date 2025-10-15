import { useNavigate } from "react-router-dom";

export default function PlaceholderManager({ title, description, icon }) {
  const navigate = useNavigate();

  return (
    <div className="max-w-7xl mx-auto p-6">
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-green-900 mb-2">{title}</h1>
          <p className="text-gray-600">{description}</p>
        </div>
        <button
          onClick={() => navigate(-1)}
          className="bg-gray-500 text-white px-4 py-2 rounded hover:bg-gray-600 transition-colors flex items-center gap-2"
        >
          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Back
        </button>
      </div>

      {/* Main Content */}
      <div className="bg-white rounded-lg shadow-md p-12 text-center">
        <div className="mb-6">
          {icon}
        </div>
        <h2 className="text-2xl font-semibold text-gray-900 mb-4">Coming Soon</h2>
        <p className="text-gray-600 mb-8 max-w-md mx-auto">
          This management page is currently under development. 
          All the features and functionality for {title.toLowerCase()} will be available soon.
        </p>
        <div className="flex justify-center space-x-4">
          <button
            onClick={() => navigate(-1)}
            className="bg-green-600 text-white px-6 py-3 rounded-lg hover:bg-green-700 transition-colors"
          >
            Go Back
          </button>
          <button
            onClick={() => window.open('/', '_blank')}
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
          >
            View Website
          </button>
        </div>
      </div>

      {/* Feature Preview */}
      <div className="mt-8 bg-gray-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">Planned Features</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Configuration</h4>
            <p className="text-sm text-gray-600">Manage all settings and preferences</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Customization</h4>
            <p className="text-sm text-gray-600">Customize appearance and behavior</p>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-sm">
            <h4 className="font-medium text-gray-900 mb-2">Analytics</h4>
            <p className="text-sm text-gray-600">View usage statistics and reports</p>
          </div>
        </div>
      </div>
    </div>
  );
}
