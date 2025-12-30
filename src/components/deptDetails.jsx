import React, { useState, useEffect, useContext, useCallback } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { 
  FiPhone, 
  FiMessageCircle, 
  FiHelpCircle, 
  FiUsers,
  FiTarget,
  FiCheckCircle,
  FiCalendar,
  FiLoader,
  FiAlertCircle,
  FiChevronLeft,
  FiStar,
  FiSend,
  FiClock,
  FiMail
} from "react-icons/fi";
import { FaUserTie, FaHandsHelping } from "react-icons/fa";
import { MdGroups, MdOutlineDescription } from "react-icons/md";
import axios from "axios";
import { AuthContext } from "../context/authContext.jsx";

const BASE_URL = import.meta.env.VITE_BASE_URL;

const DepartmentDetail = () => {
  const { user, token, isAuthenticated } = useContext(AuthContext);
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [dept, setDept] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [newComment, setNewComment] = useState("");
  const [submittingComment, setSubmittingComment] = useState(false);
  const [commentError, setCommentError] = useState("");

  // Fetch department data with better error handling
  const fetchDepartment = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await axios.get(`${BASE_URL}/api/departments/${id}`);
      setDept(res.data);
    } catch (err) {
      console.error("Error fetching department:", err);
      setError(err.response?.data?.message || "Failed to load department details");
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    fetchDepartment();
  }, [fetchDepartment]);

  // Add comment with improved error handling
  const handleAddComment = async () => {
    const trimmedComment = newComment.trim();
    if (!trimmedComment) {
      setCommentError("Comment cannot be empty");
      return;
    }

    setCommentError("");
    setSubmittingComment(true);

    if (!isAuthenticated || !token) {
      setCommentError("You must be logged in to comment.");
      setTimeout(() => navigate("/login"), 1500);
      setSubmittingComment(false);
      return;
    }

    try {
      const res = await axios.post(
        `${BASE_URL}/api/departments/${id}/comments`,
        {
          name: user?.fullName || user?.username || "Anonymous",
          email: user?.email || "",
          text: trimmedComment,
        },
        {
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
        }
      );

      setDept(res.data);
      setNewComment("");
      setCommentError("");
    } catch (err) {
      console.error("Error adding comment:", err);
      
      if (err.response?.status === 401) {
        setCommentError("Session expired. Please login again.");
        setTimeout(() => navigate("/login"), 1500);
      } else if (err.response?.status === 403) {
        setCommentError("You don't have permission to comment.");
      } else {
        setCommentError(err.response?.data?.message || "Failed to add comment. Please try again.");
      }
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey && !submittingComment) {
      e.preventDefault();
      handleAddComment();
    }
  };

  if (loading) {
    return (
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20 px-6 flex items-center justify-center min-h-screen">
        <div className="text-center">
          <FiLoader className="animate-spin text-5xl text-yellow-300 mx-auto mb-6" />
          <p className="text-xl text-gray-300">Loading department details...</p>
        </div>
      </section>
    );
  }

  if (error || !dept) {
    return (
      <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-20 px-6 flex items-center justify-center min-h-screen">
        <div className="text-center max-w-md bg-gray-800/50 backdrop-blur-sm p-10 rounded-2xl border border-red-500/30">
          <FiAlertCircle className="text-6xl text-red-400 mx-auto mb-6" />
          <h3 className="text-2xl font-bold text-red-400 mb-4">Department Not Found</h3>
          <p className="text-gray-300 mb-8">{error || "The department you're looking for doesn't exist."}</p>
          <div className="flex gap-4 justify-center">
            <button
              onClick={() => navigate(-1)}
              className="bg-gray-700 hover:bg-gray-600 text-white font-bold py-3 px-6 rounded-xl transition"
            >
              <FiChevronLeft className="inline mr-2" />
              Go Back
            </button>
            <Link
              to="/departments"
              className="bg-yellow-300 hover:bg-yellow-400 text-gray-900 font-bold py-3 px-6 rounded-xl transition"
            >
              Browse Departments
            </Link>
          </div>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-gradient-to-b from-gray-900 to-gray-800 py-8 px-4 sm:px-6 lg:px-8 min-h-screen">
      <div className="max-w-7xl mx-auto">
        {/* Back Button */}
        <div className="mb-8">
          <button
            onClick={() => navigate(-1)}
            className="inline-flex items-center gap-2 text-yellow-300 hover:text-yellow-200 transition font-medium"
          >
            <FiChevronLeft className="text-xl" />
            Back to Departments
          </button>
        </div>

        {/* Department Header */}
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 backdrop-blur-sm rounded-3xl p-8 md:p-12 mb-8 border border-yellow-400/30">
          <div className="flex flex-col md:flex-row md:items-start justify-between gap-8">
            <div className="flex-1">
              <h1 className="text-4xl md:text-5xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 to-orange-400 mb-4">
                {dept.name}
              </h1>
              <div className="flex flex-wrap gap-6 mb-6">
                <div className="flex items-center gap-3 text-gray-300">
                  <FaUserTie className="text-yellow-400 text-xl" />
                  <span>
                    <strong className="text-yellow-300">President:</strong> {dept.president}
                  </span>
                </div>
                {dept.est && (
                  <div className="flex items-center gap-3 text-gray-300">
                    <FiCalendar className="text-yellow-400 text-xl" />
                    <span>
                      <strong className="text-yellow-300">Established:</strong> {dept.est}
                    </span>
                  </div>
                )}
              </div>
              <p className="text-xl text-gray-300 leading-relaxed">{dept.description}</p>
            </div>
            
            {/* Contact Icons */}
            <div className="flex gap-6 text-2xl">
              {dept.phone && (
                <a
                  href={`tel:${dept.phone}`}
                  className="text-yellow-300 hover:text-green-400 transition p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700/50"
                  title="Call Department"
                >
                  <FiPhone />
                </a>
              )}
              <button
                className="text-yellow-300 hover:text-blue-400 transition p-3 bg-gray-800/50 rounded-xl hover:bg-gray-700/50"
                title="Support"
                onClick={() => navigate(`/contact?dept=${dept.name}`)}
              >
                <FiHelpCircle />
              </button>
            </div>
          </div>
        </div>

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
          {/* Left Column - Members & Committee */}
          <div className="lg:col-span-2 space-y-8">
            {/* Members Card */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <MdGroups className="text-3xl text-yellow-400" />
                <h2 className="text-2xl font-bold text-yellow-300">Active Members</h2>
                <span className="bg-yellow-400/20 text-yellow-300 px-3 py-1 rounded-full text-sm font-medium">
                  {dept.members?.length || 0} members
                </span>
              </div>
              <ul className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {dept.members?.map((member, i) => (
                  <li
                    key={i}
                    className="flex items-center gap-3 p-4 bg-gray-900/50 rounded-xl hover:bg-gray-800/70 transition group"
                  >
                    <div className="w-10 h-10 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-gray-900 font-bold">
                      {member.charAt(0).toUpperCase()}
                    </div>
                    <span className="text-gray-300 group-hover:text-yellow-200 transition">
                      {member}
                    </span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Committee Card */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300">
              <div className="flex items-center gap-3 mb-6">
                <FaUserTie className="text-2xl text-yellow-400" />
                <h2 className="text-2xl font-bold text-yellow-300">Leadership Committee</h2>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {dept.committee?.map((member, i) => (
                  <div
                    key={i}
                    className="p-4 bg-gradient-to-r from-gray-900/50 to-gray-800/50 rounded-xl border border-gray-700 hover:border-yellow-400/30 transition"
                  >
                    <div className="flex items-center gap-3 mb-2">
                      <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-full flex items-center justify-center text-white text-lg font-bold">
                        {member.name.charAt(0).toUpperCase()}
                      </div>
                      <div>
                        <h3 className="font-bold text-yellow-300">{member.name}</h3>
                        <p className="text-sm text-gray-400">{member.role}</p>
                      </div>
                    </div>
                    {member.bio && (
                      <p className="text-gray-400 text-sm mt-2">{member.bio}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Column - Plans & Actions */}
          <div className="space-y-8">
            {/* Plans Card */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <FiTarget className="text-2xl text-yellow-400" />
                <h2 className="text-2xl font-bold text-yellow-300">Future Plans</h2>
                <span className="bg-blue-400/20 text-blue-300 px-3 py-1 rounded-full text-sm font-medium">
                  {dept.plans?.length || 0} plans
                </span>
              </div>
              <ul className="space-y-3">
                {dept.plans?.map((plan, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-xl hover:bg-gray-800/70 transition"
                  >
                    <FiStar className="text-yellow-400 mt-1 flex-shrink-0" />
                    <span className="text-gray-300">{plan}</span>
                  </li>
                ))}
              </ul>
            </div>

            {/* Actions Card */}
            <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 border border-gray-700 hover:border-yellow-400/50 transition-all duration-300 h-fit">
              <div className="flex items-center gap-3 mb-6">
                <FiCheckCircle className="text-2xl text-yellow-400" />
                <h2 className="text-2xl font-bold text-yellow-300">Recent Actions</h2>
                <span className="bg-green-400/20 text-green-300 px-3 py-1 rounded-full text-sm font-medium">
                  {dept.actions?.length || 0} completed
                </span>
              </div>
              <ul className="space-y-3">
                {dept.actions?.map((action, i) => (
                  <li
                    key={i}
                    className="flex items-start gap-3 p-3 bg-gray-900/50 rounded-xl hover:bg-gray-800/70 transition"
                  >
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5">
                      <FiCheckCircle className="text-white text-sm" />
                    </div>
                    <span className="text-gray-300">{action}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </div>

        {/* Comments Section */}
        <div className="bg-gray-800/80 backdrop-blur-sm rounded-2xl shadow-2xl p-6 md:p-8 border border-gray-700">
          <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-3">
              <FiMessageCircle className="text-3xl text-yellow-400" />
              <div>
                <h2 className="text-2xl font-bold text-yellow-300">Community Comments</h2>
                <p className="text-gray-400">Share your thoughts about this department</p>
              </div>
            </div>
            <div className="bg-yellow-400/20 text-yellow-300 px-4 py-2 rounded-full text-sm font-medium">
              {dept.comments?.length || 0} comments
            </div>
          </div>

          {/* Comments List */}
          <div className="mb-8 max-h-[500px] overflow-y-auto pr-4 space-y-6">
            {dept.comments?.length === 0 ? (
              <div className="text-center py-12 bg-gray-900/50 rounded-2xl">
                <FiMessageCircle className="text-6xl text-gray-600 mx-auto mb-6" />
                <p className="text-gray-400 text-lg">No comments yet</p>
                <p className="text-gray-500 mt-2">
                  {isAuthenticated ? "Be the first to share your thoughts!" : "Login to comment"}
                </p>
              </div>
            ) : (
              dept.comments?.map((comment) => (
                <div
                  key={comment._id}
                  className="bg-gray-900/70 p-6 rounded-2xl border border-gray-700 hover:border-yellow-400/50 transition"
                >
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-gradient-to-br from-yellow-400 to-orange-500 rounded-full flex items-center justify-center text-gray-900 font-bold text-lg">
                        {comment.name?.charAt(0).toUpperCase() || "A"}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <h3 className="font-bold text-yellow-300">{comment.name}</h3>
                          {comment.email && (
                            <span className="text-xs text-gray-500 flex items-center gap-1">
                              <FiMail className="text-xs" />
                              {comment.email}
                            </span>
                          )}
                        </div>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <FiClock className="text-xs" />
                          {new Date(comment.createdAt).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                            hour: "2-digit",
                            minute: "2-digit",
                          })}
                        </div>
                      </div>
                    </div>
                  </div>

                  <p className="text-gray-200 text-lg leading-relaxed mb-4">{comment.text}</p>

                  {/* Replies */}
                  {comment.replies && comment.replies.length > 0 && (
                    <div className="ml-4 pl-6 border-l-4 border-yellow-400/30 mt-4">
                      <div className="flex items-center gap-2 mb-3">
                        <FaHandsHelping className="text-yellow-400" />
                        <h4 className="text-sm font-medium text-yellow-300">
                          Replies ({comment.replies.length})
                        </h4>
                      </div>
                      <div className="space-y-3">
                        {comment.replies.map((reply) => (
                          <div
                            key={reply._id}
                            className="bg-gray-800/50 p-4 rounded-xl border border-gray-700"
                          >
                            <div className="flex items-center gap-3 mb-2">
                              <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-teal-500 rounded-full flex items-center justify-center text-white text-xs font-bold">
                                {reply.name?.charAt(0).toUpperCase() || "R"}
                              </div>
                              <div>
                                <p className="text-sm font-medium text-gray-300">{reply.name}</p>
                                <div className="flex items-center gap-2 text-xs text-gray-500">
                                  <FiClock className="text-xs" />
                                  {new Date(reply.createdAt).toLocaleTimeString([], {
                                    hour: "2-digit",
                                    minute: "2-digit",
                                  })}
                                </div>
                              </div>
                            </div>
                            <p className="text-gray-400 text-sm">{reply.text}</p>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              ))
            )}
          </div>

          {/* Add Comment Form */}
          <div className="border-t-2 border-gray-700 pt-8">
            {commentError && (
              <div className="mb-6 p-4 bg-red-900/50 border border-red-600 rounded-xl flex items-start gap-3">
                <FiAlertCircle className="text-2xl text-red-400 flex-shrink-0 mt-0.5" />
                <p className="text-red-300">{commentError}</p>
              </div>
            )}

            <div className="flex flex-col sm:flex-row gap-4">
              <div className="flex-1">
                <input
                  type="text"
                  placeholder={
                    isAuthenticated
                      ? "Share your thoughts about this department..."
                      : "Please login to comment"
                  }
                  value={newComment}
                  onChange={(e) => {
                    setNewComment(e.target.value);
                    setCommentError("");
                  }}
                  onKeyDown={handleKeyDown}
                  disabled={!isAuthenticated || submittingComment}
                  className="w-full px-6 py-4 bg-gray-900/70 text-gray-100 rounded-2xl border border-gray-700 focus:border-yellow-400 focus:outline-none focus:ring-4 focus:ring-yellow-400/20 transition disabled:opacity-60"
                />
                {!isAuthenticated && (
                  <p className="text-gray-400 text-sm mt-3">
                    You need to be logged in to comment.{" "}
                    <Link to="/login" className="text-yellow-300 hover:underline font-medium">
                      Login here
                    </Link>
                  </p>
                )}
              </div>

              <button
                onClick={handleAddComment}
                disabled={!newComment.trim() || !isAuthenticated || submittingComment}
                className="bg-gradient-to-r from-yellow-400 to-orange-500 hover:from-yellow-500 hover:to-orange-600 text-gray-900 font-bold px-8 py-4 rounded-2xl transition-all duration-300 shadow-lg hover:shadow-2xl disabled:opacity-60 disabled:cursor-not-allowed flex items-center justify-center gap-3 min-w-[140px]"
              >
                {submittingComment ? (
                  <>
                    <FiLoader className="animate-spin text-xl" />
                    <span>Posting...</span>
                  </>
                ) : (
                  <>
                    <FiSend className="text-xl" />
                    <span>Comment</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default DepartmentDetail;