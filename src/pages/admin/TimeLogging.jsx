import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert } from "../../services/notificationService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaClock, FaSignInAlt, FaSignOutAlt, FaUser, FaFilter } from 'react-icons/fa';

const TimeLogging = () => {
  const { token } = useAuth();
  const [allTimeLogs, setAllTimeLogs] = useState([]);
  const [timeLogs, setTimeLogs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [actionFilter, setActionFilter] = useState('');
  const [customerFilter, setCustomerFilter] = useState('');
  const [dateFrom, setDateFrom] = useState('');
  const [dateTo, setDateTo] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [customers, setCustomers] = useState([]);
  const [stats, setStats] = useState({
    totalLogs: 0,
    loginLogs: 0,
    logoutLogs: 0,
  });

  const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Fetch all customers for filter
  const fetchCustomers = useCallback(async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/customers?per_page=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.customers) {
          setCustomers(data.customers);
        }
      }
    } catch (error) {
      console.error("Error fetching customers:", error);
    }
  }, [token, apiBaseUrl]);

  // Fetch all time logs
  const fetchAllTimeLogs = useCallback(async () => {
    setLoading(true);
    setInitialLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/customer-time-logs?per_page=1000`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      let data;
      try {
        data = await response.json();
      } catch (jsonError) {
        console.error("Failed to parse JSON response:", jsonError);
        const text = await response.text();
        console.error("Response text:", text);
        throw new Error(
          `Invalid response from server: ${response.status} ${response.statusText}`
        );
      }

      if (!response.ok) {
        console.error("API Error Response:", data);
        const errorMessage =
          data.message ||
          data.error ||
          `Server error: ${response.status} ${response.statusText}`;
        throw new Error(errorMessage);
      }

      if (data.success && data.time_logs) {
        setAllTimeLogs(data.time_logs);
        
        // Calculate stats
        const loginCount = data.time_logs.filter(log => log.action === 'login').length;
        const logoutCount = data.time_logs.filter(log => log.action === 'logout').length;
        setStats({
          totalLogs: data.time_logs.length,
          loginLogs: loginCount,
          logoutLogs: logoutCount,
        });
      } else {
        setAllTimeLogs([]);
        setStats({
          totalLogs: 0,
          loginLogs: 0,
          logoutLogs: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching time logs:", error);
      showAlert.error(
        "Time Logs Error",
        error.message || "Unable to load time logs"
      );
      setAllTimeLogs([]);
      setStats({
        totalLogs: 0,
        loginLogs: 0,
        logoutLogs: 0,
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [token, apiBaseUrl]);

  // Filter and paginate time logs client-side
  const filterAndPaginateTimeLogs = useCallback(() => {
    let filtered = [...allTimeLogs];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((log) => {
        const nameMatch = log.customer_name?.toLowerCase().includes(search);
        const emailMatch = log.customer_email?.toLowerCase().includes(search);
        return nameMatch || emailMatch;
      });
    }

    // Apply action filter
    if (actionFilter) {
      filtered = filtered.filter(log => log.action === actionFilter);
    }

    // Apply customer filter
    if (customerFilter) {
      filtered = filtered.filter(log => log.customer_id === parseInt(customerFilter));
    }

    // Apply date filters
    if (dateFrom) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.logged_at);
        return logDate >= new Date(dateFrom);
      });
    }
    if (dateTo) {
      filtered = filtered.filter(log => {
        const logDate = new Date(log.logged_at);
        const toDate = new Date(dateTo);
        toDate.setHours(23, 59, 59, 999); // Include entire day
        return logDate <= toDate;
      });
    }

    // Calculate pagination
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    // Update displayed time logs
    setTimeLogs(paginated);
    
    // Update pagination meta
    setPaginationMeta({
      current_page: currentPage,
      last_page: lastPage,
      total: total,
      from: total > 0 ? startIndex + 1 : 0,
      to: Math.min(endIndex, total),
    });
  }, [allTimeLogs, searchTerm, actionFilter, customerFilter, dateFrom, dateTo, currentPage, itemsPerPage]);

  // Fetch all time logs on mount
  useEffect(() => {
    fetchAllTimeLogs();
    fetchCustomers();
  }, [fetchAllTimeLogs, fetchCustomers]);

  // Filter and paginate when filters change
  useEffect(() => {
    if (!initialLoading) {
      filterAndPaginateTimeLogs();
    }
  }, [filterAndPaginateTimeLogs, initialLoading]);

  // Ensure toast container has highest z-index above modals
  useEffect(() => {
    const setToastZIndex = () => {
      const toastContainers = document.querySelectorAll('.Toastify__toast-container');
      toastContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.setProperty('z-index', '100002', 'important');
          container.style.setProperty('position', 'fixed', 'important');
        }
      });
      
      const toasts = document.querySelectorAll('.Toastify__toast');
      toasts.forEach(toast => {
        if (toast instanceof HTMLElement) {
          toast.style.setProperty('z-index', '100002', 'important');
        }
      });
    };

    setToastZIndex();
    
    const timeouts = [
      setTimeout(setToastZIndex, 10),
      setTimeout(setToastZIndex, 50),
      setTimeout(setToastZIndex, 100),
      setTimeout(setToastZIndex, 200),
      setTimeout(setToastZIndex, 500),
    ];
    
    const observer = new MutationObserver(() => {
      setToastZIndex();
    });
    const body = document.body;
    observer.observe(body, { childList: true, subtree: true, attributes: true, attributeFilter: ['style', 'class'] });

    return () => {
      timeouts.forEach(timeout => clearTimeout(timeout));
      observer.disconnect();
    };
  }, []);

  const handleSearchChange = (event) => {
    setSearchTerm(event.target.value);
    setCurrentPage(1);
  };

  const isActionDisabled = () => actionLock || actionLoading !== null;

  const startIndex = useMemo(() => {
    return (paginationMeta.current_page - 1) * itemsPerPage;
  }, [paginationMeta, itemsPerPage]);

  const formatDateTime = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
      second: '2-digit',
      hour12: true,
    });
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'N/A';
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  // Skeleton loaders
  const StatsCardSkeleton = () => (
    <div 
      className="card stats-card h-100 shadow-sm"
      style={{ 
        border: '1px solid rgba(0, 0, 0, 0.125)',
        borderRadius: '0.375rem'
      }}
    >
      <div className="card-body p-3">
        <div className="d-flex align-items-center">
          <div className="flex-grow-1">
            <div className="placeholder-wave mb-2">
              <span className="placeholder col-9" style={{ height: '14px' }}></span>
            </div>
            <div className="placeholder-wave">
              <span className="placeholder col-5" style={{ height: '28px' }}></span>
            </div>
          </div>
          <div className="col-auto">
            <div className="placeholder-wave">
              <span
                className="placeholder rounded-circle"
                style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50% !important',
                }}
              ></span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const TableRowSkeleton = () => (
    <tr>
      <td className="text-center">
        <span className="placeholder col-1"></span>
      </td>
      <td>
        <span className="placeholder col-8"></span>
      </td>
      <td>
        <span className="placeholder col-6"></span>
      </td>
      <td className="text-center">
        <span className="placeholder col-3"></span>
      </td>
      <td>
        <span className="placeholder col-10"></span>
      </td>
      <td className="text-center">
        <span className="placeholder col-8"></span>
      </td>
      <td className="text-center">
        <span className="placeholder col-6"></span>
      </td>
    </tr>
  );

  const EmptyState = () => (
    <div className="text-center py-5">
      <FaClock className="mb-3" style={{ fontSize: '3rem', color: 'var(--text-muted)', opacity: 0.5 }} />
      <h5 className="text-muted mb-2">No time logs found</h5>
      <p className="text-muted small mb-3">
        {searchTerm || actionFilter || customerFilter || dateFrom || dateTo
          ? "Try adjusting your search or filter criteria"
          : "No customer login/logout activity has been recorded yet"}
      </p>
      {(searchTerm || actionFilter || customerFilter || dateFrom || dateTo) && (
        <button
          className="btn btn-sm btn-primary"
          onClick={() => {
            setSearchTerm("");
            setActionFilter("");
            setCustomerFilter("");
            setDateFrom("");
            setDateTo("");
          }}
        >
          Clear Filters
        </button>
      )}
    </div>
  );

  return (
    <div className="container-fluid px-3 pt-0 pb-2 admin-dashboard-container fadeIn">
      <ToastContainer position="top-right" autoClose={3000} />
      
      {/* Page Header */}
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            <FaClock className="me-2" />
            Customer Time Logging
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Track customer login and logout activity
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <div
            className="badge px-3 py-2 text-white"
            style={{ backgroundColor: "var(--primary-color)" }}
          >
            <i className="fas fa-clock me-2"></i>
            Total Logs: {loading ? '...' : stats.totalLogs}
          </div>
          <button
            className="btn btn-sm"
            onClick={fetchAllTimeLogs}
            disabled={loading || isActionDisabled()}
            style={{
              transition: "all 0.2s ease-in-out",
              border: "2px solid var(--primary-color)",
              color: "var(--primary-color)",
              backgroundColor: "transparent",
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
                e.target.style.backgroundColor = "var(--primary-color)";
                e.target.style.color = "white";
              }
            }}
            onMouseLeave={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = "translateY(0)";
                e.target.style.boxShadow = "none";
                e.target.style.backgroundColor = "transparent";
                e.target.style.color = "var(--primary-color)";
              }
            }}
          >
            <i className="fas fa-sync-alt me-1"></i>
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      <div className="row g-3 mb-4">
        {[
          { label: "Total Logs", value: stats.totalLogs, icon: "fa-clock", color: "var(--primary-color)" },
          { label: "Login Logs", value: stats.loginLogs, icon: "fa-sign-in-alt", color: "#28a745" },
          { label: "Logout Logs", value: stats.logoutLogs, icon: "fa-sign-out-alt", color: "#dc3545" },
        ].map((stat, idx) => (
          <div className="col-6 col-md-4" key={idx}>
            {initialLoading ? (
              <StatsCardSkeleton />
            ) : (
              <div 
                className="card stats-card h-100 shadow-sm"
                style={{ 
                  border: '1px solid rgba(0, 0, 0, 0.125)',
                  borderRadius: '0.375rem'
                }}
              >
                <div className="card-body p-3">
                  <div className="d-flex align-items-center">
                    <div className="flex-grow-1">
                      <div
                        className="text-xs fw-semibold text-uppercase mb-1"
                        style={{ color: stat.color }}
                      >
                        {stat.label}
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{ color: stat.color }}
                      >
                        {stat.value}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i
                        className={`fas ${stat.icon} fa-2x`}
                        style={{
                          color: stat.color,
                          opacity: 0.7,
                        }}
                      ></i>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Filters */}
      <div
        className="card border-0 shadow-sm mb-3"
        style={{ backgroundColor: "var(--background-white)" }}
      >
        <div className="card-body p-3">
          <div className="row g-2 align-items-start">
            <div className="col-md-3">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Search Customers
              </label>
              <div className="input-group input-group-sm">
                <span
                  className="input-group-text"
                  style={{
                    backgroundColor: "var(--background-light)",
                    borderColor: "var(--input-border)",
                    color: "var(--text-muted)",
                  }}
                >
                  <i className="fas fa-search"></i>
                </span>
                <input
                  type="text"
                  className="form-control"
                  placeholder="Search by name or email..."
                  value={searchTerm}
                  onChange={handleSearchChange}
                  style={{
                    backgroundColor: "var(--input-bg)",
                    borderColor: "var(--input-border)",
                    color: "var(--input-text)",
                  }}
                />
                {searchTerm && (
                  <button
                    className="btn btn-sm clear-search-btn"
                    type="button"
                    onClick={() => setSearchTerm("")}
                    disabled={loading || isActionDisabled()}
                    style={{
                      color: "#6c757d",
                      backgroundColor: "transparent",
                      border: "none",
                      padding: "0.25rem 0.5rem",
                    }}
                    onMouseEnter={(e) => {
                      if (!e.target.disabled) {
                        const icon = e.target.querySelector("i");
                        if (icon) icon.style.color = "white";
                        e.target.style.color = "white";
                        e.target.style.backgroundColor = "#dc3545";
                      }
                    }}
                    onMouseLeave={(e) => {
                      if (!e.target.disabled) {
                        const icon = e.target.querySelector("i");
                        if (icon) icon.style.color = "#6c757d";
                        e.target.style.color = "#6c757d";
                        e.target.style.backgroundColor = "transparent";
                      }
                    }}
                  >
                    <i
                      className="fas fa-times"
                      style={{ color: "inherit" }}
                    ></i>
                  </button>
                )}
              </div>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Filter by Action
              </label>
              <select
                className="form-select form-select-sm"
                value={actionFilter}
                onChange={(e) => {
                  setActionFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="">All Actions</option>
                <option value="login">Login</option>
                <option value="logout">Logout</option>
              </select>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Filter by Customer
              </label>
              <select
                className="form-select form-select-sm"
                value={customerFilter}
                onChange={(e) => {
                  setCustomerFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="">All Customers</option>
                {customers.map((customer) => (
                  <option key={customer.id} value={customer.id}>
                    {customer.name}
                  </option>
                ))}
              </select>
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Date From
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateFrom}
                onChange={(e) => {
                  setDateFrom(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              />
            </div>
            <div className="col-md-2">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Date To
              </label>
              <input
                type="date"
                className="form-control form-control-sm"
                value={dateTo}
                onChange={(e) => {
                  setDateTo(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              />
            </div>
            <div className="col-md-1">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Per Page
              </label>
              <select
                className="form-select form-select-sm"
                value={itemsPerPage}
                onChange={(e) => {
                  setItemsPerPage(Number(e.target.value));
                  setCurrentPage(1);
                }}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                {[5, 10, 20, 50].map((size) => (
                  <option key={size} value={size}>
                    {size}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

      {/* Time Logs Table */}
      <div
        className="card border-0 shadow-sm"
        style={{ backgroundColor: "var(--background-white)" }}
      >
        <div
          className="card-header border-bottom-0 py-2"
          style={{
            background: "var(--topbar-bg)",
            color: "var(--topbar-text)",
          }}
        >
          <div className="d-flex justify-content-between align-items-center">
            <h5 className="card-title mb-0 fw-semibold text-white">
              <i className="fas fa-clock me-2"></i>
              Time Logs
              {!loading && (
                <small className="opacity-75 ms-2 text-white">
                  ({paginationMeta.total} total)
                </small>
              )}
            </h5>
          </div>
        </div>
        <div className="card-body p-0">
          {loading ? (
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: "var(--background-light)" }}>
                  <tr>
                    <th className="text-center small fw-semibold" style={{ width: "4%" }}>#</th>
                    <th className="small fw-semibold" style={{ width: "20%" }}>Customer</th>
                    <th className="small fw-semibold" style={{ width: "20%" }}>Email</th>
                    <th className="text-center small fw-semibold" style={{ width: "10%" }}>Action</th>
                    <th className="small fw-semibold" style={{ width: "20%" }}>Date & Time</th>
                    <th className="text-center small fw-semibold" style={{ width: "13%" }}>IP Address</th>
                    <th className="text-center small fw-semibold" style={{ width: "13%" }}>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {[...Array(5)].map((_, idx) => (
                    <TableRowSkeleton key={idx} />
                  ))}
                </tbody>
              </table>
              <div className="text-center py-4">
                <div
                  className="spinner-border me-2"
                  style={{ color: "var(--primary-color)" }}
                  role="status"
                >
                  <span className="visually-hidden">Loading...</span>
                </div>
                <span className="small" style={{ color: "var(--text-muted)" }}>
                  Fetching time logs data...
                </span>
              </div>
            </div>
          ) : timeLogs.length === 0 ? (
            <EmptyState />
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: "var(--background-light)" }}>
                  <tr>
                    <th className="text-center small fw-semibold" style={{ width: "4%" }}>#</th>
                    <th className="small fw-semibold" style={{ width: "20%" }}>Customer</th>
                    <th className="small fw-semibold" style={{ width: "20%" }}>Email</th>
                    <th className="text-center small fw-semibold" style={{ width: "10%" }}>Action</th>
                    <th className="small fw-semibold" style={{ width: "20%" }}>Date & Time</th>
                    <th className="text-center small fw-semibold" style={{ width: "13%" }}>IP Address</th>
                    <th className="text-center small fw-semibold" style={{ width: "13%" }}>User Agent</th>
                  </tr>
                </thead>
                <tbody>
                  {timeLogs.map((log, index) => (
                    <tr key={log.id} className="align-middle">
                      <td
                        className="text-center fw-bold"
                        style={{ color: "var(--text-primary)" }}
                      >
                        {startIndex + index + 1}
                      </td>
                      <td style={{ maxWidth: "200px", overflow: "hidden" }}>
                        <div
                          className="fw-medium"
                          style={{
                            color: "var(--text-primary)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={log.customer_name}
                        >
                          {log.customer_name || 'N/A'}
                        </div>
                      </td>
                      <td style={{ maxWidth: "200px", overflow: "hidden" }}>
                        <div
                          className="small"
                          style={{
                            color: "var(--text-muted)",
                            overflow: "hidden",
                            textOverflow: "ellipsis",
                            whiteSpace: "nowrap",
                          }}
                          title={log.customer_email}
                        >
                          {log.customer_email || 'N/A'}
                        </div>
                      </td>
                      <td className="text-center">
                        {log.action === 'login' ? (
                          <span className="badge bg-success">
                            <FaSignInAlt className="me-1" />
                            Login
                          </span>
                        ) : (
                          <span className="badge bg-danger">
                            <FaSignOutAlt className="me-1" />
                            Logout
                          </span>
                        )}
                      </td>
                      <td className="text-muted small">
                        {log.logged_at ? formatDateTime(log.logged_at) : 'N/A'}
                      </td>
                      <td className="text-center text-muted small">
                        {log.ip_address || 'N/A'}
                      </td>
                      <td className="text-center text-muted small" style={{ maxWidth: "150px", overflow: "hidden", textOverflow: "ellipsis" }} title={log.user_agent || 'N/A'}>
                        {log.user_agent ? (log.user_agent.length > 30 ? log.user_agent.substring(0, 30) + '...' : log.user_agent) : 'N/A'}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Pagination */}
        {!loading && timeLogs.length > 0 && (
          <div
            className="card-footer border-top-0 py-2"
            style={{ backgroundColor: "var(--background-light)" }}
          >
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
              <div className="small text-muted">
                Showing {paginationMeta.from} to {paginationMeta.to} of{" "}
                {paginationMeta.total} time logs
              </div>
              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setCurrentPage(1)}
                  disabled={currentPage === 1 || loading}
                >
                  <i className="fas fa-angle-double-left"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                  disabled={currentPage === 1 || loading}
                >
                  <i className="fas fa-angle-left"></i>
                </button>
                <span className="small text-muted">
                  Page {paginationMeta.current_page} of {paginationMeta.last_page}
                </span>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(paginationMeta.last_page, prev + 1)
                    )
                  }
                  disabled={
                    currentPage === paginationMeta.last_page || loading
                  }
                >
                  <i className="fas fa-angle-right"></i>
                </button>
                <button
                  className="btn btn-sm btn-outline-primary"
                  onClick={() => setCurrentPage(paginationMeta.last_page)}
                  disabled={
                    currentPage === paginationMeta.last_page || loading
                  }
                >
                  <i className="fas fa-angle-double-right"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default TimeLogging;

