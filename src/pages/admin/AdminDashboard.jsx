// src/pages/admin/AdminDashboard.jsx
import { useEffect, useState } from "react";
import { useAuth } from "../../contexts/AuthContext";
import {
  FaUsers,
  FaFileInvoice,
  FaChartBar,
  FaMoneyCheckAlt,
  FaExclamationTriangle,
  FaCheckCircle,
  FaClock,
  FaHistory,
  FaDownload,
  FaCog,
  FaBell,
  FaChartLine,
  FaDatabase,
  FaSyncAlt,
} from "react-icons/fa";

const formatNumber = (value = 0) =>
  Number(value || 0).toLocaleString(undefined, { maximumFractionDigits: 0 });

const formatCurrency = (value = 0) =>
  `₱${Number(value || 0).toLocaleString(undefined, {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`;

export default function AdminDashboard() {
  const { admin } = useAuth();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Mock data for now - replace with actual API calls later
  const stats = {
    totalCustomers: 0,
    pendingApprovals: 0,
    totalRevenue: 0,
    delinquentAccounts: 0,
    activeConnections: 0,
    monthlyConsumption: 0,
    staffMembers: 0,
    systemUptime: 100,
    pendingBills: 0,
  };

  useEffect(() => {
    // Simulate loading
    setTimeout(() => {
      setLoading(false);
    }, 1000);
  }, []);

  const handleRefresh = () => {
    setRefreshing(true);
    setTimeout(() => {
      setRefreshing(false);
    }, 1000);
  };

  if (loading) {
    return (
      <div className="container-fluid px-3 py-2 admin-dashboard-container fadeIn">
        <div className="d-flex justify-content-center align-items-center" style={{ minHeight: "400px" }}>
          <div className="text-center">
            <div className="spinner-border mb-3" style={{ color: "var(--primary-color)" }} role="status">
              <span className="visually-hidden">Loading...</span>
            </div>
            <p className="text-muted">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="container-fluid px-3 pt-0 pb-2 admin-dashboard-container fadeIn">
      {/* Page Header */}
      <div className="d-flex flex-column flex-lg-row justify-content-between align-items-start align-items-lg-center mb-4 gap-3">
        <div className="text-start w-100">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            Admin Dashboard
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            {admin?.username
              ? `Welcome back, ${admin.username.split("@")[0]}! `
              : "Welcome back! "}
            Here's your system overview.
          </p>
        </div>
        <div className="d-flex gap-2 w-100 w-lg-auto justify-content-start justify-content-lg-end flex-wrap">
          <button
            className="btn btn-sm d-flex align-items-center"
            onClick={handleRefresh}
            disabled={refreshing}
            style={{
              transition: "all 0.2s ease-in-out",
              border: "2px solid var(--primary-color)",
              color: "var(--primary-color)",
              backgroundColor: "transparent",
            }}
          >
            {refreshing ? (
              <>
                <span className="spinner-border spinner-border-sm me-2" />
                Refreshing
              </>
            ) : (
              <>
                <FaSyncAlt className="me-2" />
                Refresh Data
              </>
            )}
          </button>
          <button
            className="btn btn-sm btn-success text-white d-flex align-items-center"
            style={{ transition: "all 0.2s ease-in-out", borderWidth: "2px" }}
          >
            <FaDownload className="me-2" />
            Export Report
          </button>
          <button
            className="btn btn-sm d-flex align-items-center"
            style={{
              transition: "all 0.2s ease-in-out",
              border: "2px solid var(--input-border)",
              color: "var(--text-primary)",
              backgroundColor: "transparent",
            }}
          >
            <FaCog className="me-2" />
            Settings
          </button>
        </div>
      </div>

      {/* Main Stats Overview */}
      <div className="row g-3 mb-4">
        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-primary text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Total Customers</div>
                  <div className="h4 fw-bold my-1">
                    {formatNumber(stats.totalCustomers)}
                  </div>
                  <div className="small d-flex align-items-center">
                    <FaChartLine className="me-1" />
                    Tracking
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaUsers size={20} className="text-primary" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-warning text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Pending Approvals</div>
                  <div className="h4 fw-bold my-1">
                    {formatNumber(stats.pendingApprovals)}
                  </div>
                  <div className="small">
                    {stats.pendingApprovals > 0
                      ? "Requires attention"
                      : "Up to date"}
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaCheckCircle size={20} className="text-warning" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-success text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Monthly Revenue</div>
                  <div className="h4 fw-bold my-1">
                    {formatCurrency(stats.totalRevenue)}
                  </div>
                  <div className="small d-flex align-items-center">
                    <FaChartLine className="me-1" />
                    This month
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaMoneyCheckAlt size={20} className="text-success" />
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-3 col-md-6">
          <div
            className="card bg-danger text-white mb-3"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body">
              <div className="d-flex justify-content-between align-items-center">
                <div>
                  <div className="text-white-50 small">Delinquent Accounts</div>
                  <div className="h4 fw-bold my-1">
                    {formatNumber(stats.delinquentAccounts)}
                  </div>
                  <div className="small">
                    {stats.delinquentAccounts > 0
                      ? "Over 30 days due"
                      : "All current"}
                  </div>
                </div>
                <div
                  className="bg-white rounded-circle d-flex align-items-center justify-content-center"
                  style={{ width: "50px", height: "50px" }}
                >
                  <FaExclamationTriangle size={20} className="text-danger" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Secondary Stats */}
      <div className="row g-3 mb-4">
        <div className="col-xl-8">
          <div className="row g-3">
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaUsers className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {formatNumber(stats.activeConnections)}
                  </div>
                  <div className="text-muted small">Active Connections</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaChartBar className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {formatNumber(Math.round(stats.monthlyConsumption))} m³
                  </div>
                  <div className="text-muted small">Monthly Usage</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaUsers className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {formatNumber(stats.staffMembers)}
                  </div>
                  <div className="text-muted small">Staff Members</div>
                </div>
              </div>
            </div>
            <div className="col-md-3 col-6">
              <div
                className="card border-0 bg-light h-100"
                style={{ borderRadius: "10px" }}
              >
                <div className="card-body text-center p-3">
                  <FaDatabase className="text-primary mb-2" size={24} />
                  <div className="fw-bold text-dark h5">
                    {stats.systemUptime?.toFixed(1)}%
                  </div>
                  <div className="text-muted small">System Uptime</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="col-xl-4">
          <div
            className="card bg-primary text-white h-100"
            style={{ borderRadius: "10px" }}
          >
            <div className="card-body d-flex justify-content-between align-items-center p-3">
              <div>
                <div className="small opacity-85 text-uppercase">
                  System Status
                </div>
                <div className="h5 mb-0">All systems operational</div>
              </div>
              <FaCheckCircle size={24} />
            </div>
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="row g-4">
        {/* Recent Activities */}
        <div className="col-xl-8">
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <div className="d-flex justify-content-between align-items-center">
                <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                  <FaHistory className="me-2 text-primary" />
                  Recent Activities
                </h5>
                <span className="badge bg-primary">0</span>
              </div>
            </div>
            <div className="card-body p-0">
              <div className="text-center py-4 text-muted">
                No activity recorded yet.
              </div>
            </div>
          </div>
        </div>

        {/* Sidebar Content */}
        <div className="col-xl-4">
          {/* Priority Tasks */}
          <div className="card mb-4" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark d-flex align-items-center">
                <FaBell className="me-2 text-warning" />
                Priority Tasks
              </h5>
            </div>
            <div className="card-body">
              <div className="text-muted small">No outstanding tasks.</div>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="card" style={{ borderRadius: "10px" }}>
            <div className="card-header bg-white border-bottom-0 py-3">
              <h5 className="card-title mb-0 text-dark">Quick Actions</h5>
            </div>
            <div className="card-body">
              <div className="d-grid gap-2">
                <button
                  className="btn btn-sm text-start py-2 d-flex align-items-center"
                  style={{
                    borderRadius: "8px",
                    border: "2px solid var(--primary-color)",
                    color: "var(--primary-color)",
                    backgroundColor: "transparent",
                  }}
                >
                  <FaUsers className="me-2" />
                  Customer Management
                </button>
                <button
                  className="btn btn-sm text-start py-2 d-flex align-items-center"
                  style={{
                    borderRadius: "8px",
                    border: "2px solid var(--primary-color)",
                    color: "var(--primary-color)",
                    backgroundColor: "transparent",
                  }}
                >
                  <FaFileInvoice className="me-2" />
                  Billing & Invoices
                </button>
                <button
                  className="btn btn-sm text-start py-2 d-flex align-items-center"
                  style={{
                    borderRadius: "8px",
                    border: "2px solid var(--primary-color)",
                    color: "var(--primary-color)",
                    backgroundColor: "transparent",
                  }}
                >
                  <FaChartBar className="me-2" />
                  Analytics & Reports
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

