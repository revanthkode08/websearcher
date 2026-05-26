import { useState, useEffect } from "react";
import axios from "axios";
import { UseAuthStore } from "../Store/AuthStore";
import { Link } from "react-router-dom";

export default function History() {
  const User = UseAuthStore(state => state.User);
  const Token = UseAuthStore(state => state.Token);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (User) {
      fetchHistory();
    } else {
      setLoading(false);
    }
  }, [User]);

  const fetchHistory = async () => {
    try {
      setLoading(true);
      const res = await axios.get(`https://websearcher-p0lw.onrender.com/app/user/history/${User._id}`);
      // Reverse to show newest first
      setHistory(res.data.reverse());
    } catch (e) {
      console.error("History fetch error", e);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString) => {
    const options = { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' };
    return new Date(dateString).toLocaleDateString(undefined, options);
  };

  if (!Token) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[70vh] px-4 font-sans bg-white dark:bg-gray-900 transition-colors">
        <div className="p-8 bg-yellow-50 dark:bg-yellow-900/30 text-yellow-800 dark:text-yellow-200 border border-yellow-200 dark:border-yellow-700/50 rounded-2xl max-w-md text-center shadow-sm">
          <p className="mb-6 font-medium text-lg">You must be logged in to view your search history.</p>
          <div className="flex gap-4 justify-center">
            <Link to="/login" className="bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-blue-700 font-medium transition-colors">Login</Link>
            <Link to="/register" className="bg-white dark:bg-gray-800 text-blue-600 dark:text-blue-400 border border-blue-600 dark:border-blue-400 px-6 py-2.5 rounded-lg shadow hover:bg-blue-50 dark:hover:bg-gray-700 font-medium transition-colors">Register</Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen font-sans bg-gray-50 dark:bg-gray-900 transition-colors pt-10 pb-20 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        <div className="flex items-center gap-4 mb-8">
          <Link to="/" className="p-2 bg-white dark:bg-gray-800 rounded-full border border-gray-200 dark:border-gray-700 shadow-sm hover:shadow-md transition-shadow text-gray-600 dark:text-gray-300">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18"></path></svg>
          </Link>
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">My Search History</h1>
        </div>
        
        <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm border border-gray-100 dark:border-gray-700 overflow-hidden">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-20">
              <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-blue-500 mb-4"></div>
              <p className="text-gray-500 dark:text-gray-400 font-medium">Loading history...</p>
            </div>
          ) : history.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 px-4 text-center">
              <div className="w-20 h-20 bg-gray-100 dark:bg-gray-700 rounded-full flex items-center justify-center mb-6">
                <svg className="w-10 h-10 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                </svg>
              </div>
              <h3 className="text-xl font-bold text-gray-900 dark:text-white mb-2">No search history</h3>
              <p className="text-gray-500 dark:text-gray-400 max-w-md">Your searches will appear here once you start exploring the web.</p>
              <Link to="/" className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-lg shadow hover:bg-blue-700 font-medium transition-colors">
                Start Searching
              </Link>
            </div>
          ) : (
            <div className="divide-y divide-gray-100 dark:divide-gray-700/50">
              {history.map((item, index) => (
                <div key={index} className="p-4 sm:p-6 hover:bg-gray-50 dark:hover:bg-gray-700/30 transition-colors flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="flex items-start gap-4">
                    <div className="mt-1 p-2 bg-blue-50 dark:bg-blue-900/30 text-blue-600 dark:text-blue-400 rounded-full border border-blue-100 dark:border-blue-800">
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
                      </svg>
                    </div>
                    <div>
                      <h3 className="text-lg font-medium text-gray-900 dark:text-white mb-1">
                        <Link to={`/?q=${encodeURIComponent(item.query)}`} className="hover:text-blue-600 dark:hover:text-blue-400 hover:underline">
                          {item.query}
                        </Link>
                      </h3>
                      <p className="text-sm text-gray-500 dark:text-gray-400 flex items-center gap-2">
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        {formatDate(item.date)}
                      </p>
                    </div>
                  </div>
                  <Link 
                    to={`/?q=${encodeURIComponent(item.query)}`} 
                    className="text-sm font-medium text-blue-600 dark:text-blue-400 hover:bg-blue-50 dark:hover:bg-blue-900/30 px-4 py-2 rounded-lg transition-colors self-start sm:self-auto border border-transparent hover:border-blue-200 dark:hover:border-blue-800"
                  >
                    Search again
                  </Link>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
