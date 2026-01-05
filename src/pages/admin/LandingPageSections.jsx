import React, {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";
import Portal from "../../components/Portal";
import { useAuth } from "../../contexts/AuthContext";
import { showAlert } from "../../services/notificationService";
import { toast, ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import LandingPageSectionFormModal from './LandingPageSectionFormModal';

const LandingPageSections = () => {
  const { token } = useAuth();
  const [allSections, setAllSections] = useState([]); // Store all sections
  const [sections, setSections] = useState([]); // Displayed sections (filtered + paginated)
  const [loading, setLoading] = useState(true);
  const [initialLoading, setInitialLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(null);
  const [actionLock, setActionLock] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState(''); // 'active', 'inactive', or '' for all
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(10);
  const [paginationMeta, setPaginationMeta] = useState({
    current_page: 1,
    last_page: 1,
    total: 0,
    from: 0,
    to: 0,
  });
  const [stats, setStats] = useState({
    totalSections: 0,
    activeSections: 0,
  });
  const [collections, setCollections] = useState([]);
  const [showSectionForm, setShowSectionForm] = useState(false);
  const [editingSection, setEditingSection] = useState(null);

  const apiBaseUrl = import.meta.env.VITE_LARAVEL_API || import.meta.env.VITE_API_URL || "http://localhost:8000";

  // Fetch all sections once on initial load
  const fetchAllSections = useCallback(async () => {
    setLoading(true);
    setInitialLoading(true);
    try {
      const response = await fetch(`${apiBaseUrl}/landing-page-sections`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
        cache: 'no-cache',
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

      if (data.success && data.sections) {
        // Sort by display_order
        const sortedSections = [...data.sections].sort((a, b) => {
          if (a.display_order !== b.display_order) {
            return a.display_order - b.display_order;
          }
          return new Date(a.created_at) - new Date(b.created_at);
        });
        
        setAllSections(sortedSections);
        
        // Calculate stats from all sections
        const activeSections = sortedSections.filter(s => s.is_active === true).length;
        setStats({
          totalSections: sortedSections.length,
          activeSections: activeSections,
        });
      } else {
        setAllSections([]);
        setStats({
          totalSections: 0,
          activeSections: 0,
        });
      }
    } catch (error) {
      console.error("Error fetching sections:", error);
      showAlert.error(
        "Sections Error",
        error.message || "Unable to load landing page sections"
      );
      setAllSections([]);
      setStats({
        totalSections: 0,
        activeSections: 0,
      });
    } finally {
      setLoading(false);
      setInitialLoading(false);
    }
  }, [token, apiBaseUrl]);

  // Filter and paginate sections client-side
  const filterAndPaginateSections = useCallback(() => {
    let filtered = [...allSections];

    // Apply search filter
    if (searchTerm.trim()) {
      const search = searchTerm.toLowerCase().trim();
      filtered = filtered.filter((section) => {
        const nameMatch = section.name?.toLowerCase().includes(search);
        const titleMatch = section.title?.toLowerCase().includes(search);
        const descMatch = section.description?.toLowerCase().includes(search);
        return nameMatch || titleMatch || descMatch;
      });
    }

    // Status filter
    if (statusFilter === 'active') {
      filtered = filtered.filter(section => section.is_active === true);
    } else if (statusFilter === 'inactive') {
      filtered = filtered.filter(section => section.is_active === false);
    }

    // Calculate pagination
    const total = filtered.length;
    const lastPage = Math.max(1, Math.ceil(total / itemsPerPage));
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    const paginated = filtered.slice(startIndex, endIndex);

    // Update displayed sections
    setSections(paginated);
    
    // Update pagination meta
    setPaginationMeta({
      current_page: currentPage,
      last_page: lastPage,
      total: total,
      from: total > 0 ? startIndex + 1 : 0,
      to: Math.min(endIndex, total),
    });
  }, [allSections, searchTerm, statusFilter, currentPage, itemsPerPage]);

  // Fetch all sections on mount
  useEffect(() => {
    fetchAllSections();
    fetchCollections();
  }, [fetchAllSections]);

  // Filter and paginate when search term, status filter, page, or items per page changes
  useEffect(() => {
    if (!initialLoading) {
      filterAndPaginateSections();
    }
  }, [filterAndPaginateSections, initialLoading]);

  const fetchCollections = async () => {
    try {
      const response = await fetch(`${apiBaseUrl}/product-collections/list`, {
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success && data.collections) {
          setCollections(data.collections);
        }
      }
    } catch (error) {
      console.error('Error fetching collections:', error);
    }
  };

  // Ensure toast container has highest z-index above modals
  useEffect(() => {
    const setToastZIndex = () => {
      const toastContainers = document.querySelectorAll('.Toastify__toast-container');
      toastContainers.forEach(container => {
        if (container instanceof HTMLElement) {
          container.style.setProperty('z-index', '100002', 'important');
          container.style.setProperty('position', 'fixed', 'important');
          const childElements = container.querySelectorAll('*');
          childElements.forEach(el => {
            if (el instanceof HTMLElement) {
              el.style.setProperty('z-index', '100002', 'important');
            }
          });
        }
      });
      
      const toasts = document.querySelectorAll('.Toastify__toast');
      toasts.forEach(toast => {
        if (toast instanceof HTMLElement) {
          toast.style.setProperty('z-index', '100002', 'important');
          if (toast.classList.contains('Toastify__toast--error')) {
            toast.style.setProperty('z-index', '100002', 'important');
            toast.style.setProperty('position', 'relative', 'important');
          }
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
    setCurrentPage(1); // Reset to first page when searching
  };

  const handleNewSection = () => {
    setEditingSection(null);
    setShowSectionForm(true);
  };

  const handleEditSection = (section) => {
    setEditingSection(section);
    setShowSectionForm(true);
  };

  const handleDeleteSection = async (section) => {
    if (actionLock) {
      toast.warning("Please wait until the current action completes", {
        style: { zIndex: 100002 }
      });
      return;
    }

    const confirmation = await showAlert.confirm(
      "Delete Section",
      `Deleting "${section.title}" will remove it from the landing page. Continue?`,
      "Delete",
      "Cancel"
    );

    if (!confirmation.isConfirmed) return;

    setActionLock(true);
    setActionLoading(section.id);
    showAlert.processing("Deleting Section", "Removing section...");

    try {
      const response = await fetch(`${apiBaseUrl}/landing-page-sections/${section.id}`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          Accept: "application/json",
        },
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.message || "Failed to delete section");
      }

      showAlert.close();
      toast.success("Section deleted successfully!", {
        style: { zIndex: 100002 }
      });
      // Remove from allSections and update stats
      setAllSections(prev => {
        const updatedSections = prev.filter(sec => sec.id !== section.id);
        
        const activeSections = updatedSections.filter(s => s.is_active === true).length;
        setStats({
          totalSections: updatedSections.length,
          activeSections: activeSections,
        });
        
        return updatedSections;
      });
    } catch (error) {
      console.error("Delete section error:", error);
      showAlert.close();
      requestAnimationFrame(() => {
        const containers = document.querySelectorAll('.Toastify__toast-container');
        containers.forEach(container => {
          if (container instanceof HTMLElement) {
            const existingStyle = container.getAttribute('style') || '';
            container.style.cssText = existingStyle + 'z-index: 100002 !important; position: fixed !important;';
          }
        });
        
        toast.error(error.message || "Unable to delete section", {
          style: { zIndex: 100002 }
        });
        
        requestAnimationFrame(() => {
          const containers = document.querySelectorAll('.Toastify__toast-container');
          containers.forEach(container => {
            if (container instanceof HTMLElement) {
              const existingStyle = container.getAttribute('style') || '';
              container.style.cssText = existingStyle + 'z-index: 100002 !important; position: fixed !important;';
            }
          });
          const toasts = document.querySelectorAll('.Toastify__toast--error');
          toasts.forEach(toastEl => {
            if (toastEl instanceof HTMLElement) {
              const toastStyle = toastEl.getAttribute('style') || '';
              toastEl.style.cssText = toastStyle + 'z-index: 100002 !important; position: relative !important;';
            }
          });
        });
      });
    } finally {
      setActionLock(false);
      setActionLoading(null);
    }
  };

  const isActionDisabled = (id = null) =>
    actionLock || (actionLoading && actionLoading !== id);

  const handleToggleActive = async (section) => {
    if (actionLock || isActionDisabled(section.id)) return;

    try {
      setActionLoading(section.id);
      setActionLock(true);

      const response = await fetch(`${apiBaseUrl}/landing-page-sections/${section.id}`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({
          is_active: !section.is_active,
        }),
      });

      if (response.ok) {
        toast.success(`Section ${!section.is_active ? 'activated' : 'deactivated'} successfully`, {
          style: { zIndex: 100002 }
        });
        // Update in allSections and recalculate stats
        setAllSections(prev => {
          const updated = prev.map(sec => 
            sec.id === section.id ? { ...sec, is_active: !sec.is_active } : sec
          );
          const activeSections = updated.filter(s => s.is_active === true).length;
          setStats({
            totalSections: updated.length,
            activeSections: activeSections,
          });
          return updated;
        });
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update section', {
          style: { zIndex: 100002 }
        });
      }
    } catch (error) {
      console.error('Error updating section:', error);
      toast.error(`Error updating section: ${error.message}`, {
        style: { zIndex: 100002 }
      });
    } finally {
      setActionLoading(null);
      setActionLock(false);
    }
  };

  const handleMoveUp = async (section, index) => {
    if (index === 0 || actionLock) return;

    const newOrder = [...allSections];
    const actualIndex = allSections.findIndex(s => s.id === section.id);
    if (actualIndex === 0) return;
    
    [newOrder[actualIndex], newOrder[actualIndex - 1]] = [newOrder[actualIndex - 1], newOrder[actualIndex]];

    await updateOrder(newOrder);
  };

  const handleMoveDown = async (section, index) => {
    if (index === allSections.length - 1 || actionLock) return;

    const newOrder = [...allSections];
    const actualIndex = allSections.findIndex(s => s.id === section.id);
    if (actualIndex === allSections.length - 1) return;
    
    [newOrder[actualIndex], newOrder[actualIndex + 1]] = [newOrder[actualIndex + 1], newOrder[actualIndex]];

    await updateOrder(newOrder);
  };

  const updateOrder = async (orderedSections) => {
    try {
      setActionLock(true);

      const sectionsData = orderedSections.map((section, index) => ({
        id: section.id,
        display_order: index + 1,
      }));

      const response = await fetch(`${apiBaseUrl}/landing-page-sections/order/update`, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'application/json',
          Accept: 'application/json',
        },
        body: JSON.stringify({ sections: sectionsData }),
      });

      if (response.ok) {
        toast.success('Section order updated successfully', {
          style: { zIndex: 100002 }
        });
        fetchAllSections();
      } else {
        const errorData = await response.json();
        toast.error(errorData.message || 'Failed to update order', {
          style: { zIndex: 100002 }
        });
      }
    } catch (error) {
      console.error('Error updating order:', error);
      toast.error(`Error updating order: ${error.message}`, {
        style: { zIndex: 100002 }
      });
    } finally {
      setActionLock(false);
    }
  };

  const handleSave = () => {
    setShowSectionForm(false);
    setEditingSection(null);
    // Refresh all sections after save
    fetchAllSections();
  };

  const startIndex = useMemo(() => {
    return (paginationMeta.current_page - 1) * itemsPerPage;
  }, [paginationMeta, itemsPerPage]);

  const getSourceLabel = (section) => {
    const collection = collections.find(c => c.slug === section.source_value);
    return collection ? collection.name : section.source_value;
  };

  return (
    <div className="container-fluid px-3 pt-0 pb-2 landing-page-sections-container fadeIn">
      <div className="d-flex flex-column flex-md-row justify-content-between align-items-start align-items-md-center mb-3">
        <div className="flex-grow-1 mb-2 mb-md-0">
          <h1
            className="h4 mb-1 fw-bold"
            style={{ color: "var(--text-primary)" }}
          >
            <i className="fas fa-layer-group me-2"></i>
            Landing Page Sections
          </h1>
          <p className="mb-0 small" style={{ color: "var(--text-muted)" }}>
            Manage sections displayed on the landing page
          </p>
        </div>
        <div className="d-flex align-items-center gap-2 flex-wrap">
          <button
            className="btn btn-sm btn-primary text-white"
            onClick={handleNewSection}
            disabled={isActionDisabled()}
            style={{
              transition: "all 0.2s ease-in-out",
              borderWidth: "2px",
              borderRadius: "4px",
            }}
            onMouseEnter={(e) => {
              if (!e.target.disabled) {
                e.target.style.transform = "translateY(-1px)";
                e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
              }
            }}
            onMouseLeave={(e) => {
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
            }}
          >
            <i className="fas fa-plus me-1" />
            New Section
          </button>
          <button
            className="btn btn-sm"
            onClick={fetchAllSections}
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
              e.target.style.transform = "translateY(0)";
              e.target.style.boxShadow = "none";
              e.target.style.backgroundColor = "transparent";
              e.target.style.color = "var(--primary-color)";
            }}
          >
            <i className="fas fa-sync-alt me-1" />
            Refresh
          </button>
        </div>
      </div>

      <div className="row g-3 mb-4">
        {[stats.totalSections, stats.activeSections].map((value, idx) => (
          <div className="col-6 col-md-3" key={idx}>
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
                        style={{
                          color:
                            idx === 0
                              ? "var(--primary-color)"
                              : "var(--accent-color)",
                        }}
                      >
                        {idx === 0 ? "Total Sections" : "Active Sections"}
                      </div>
                      <div
                        className="h4 mb-0 fw-bold"
                        style={{
                          color:
                            idx === 0
                              ? "var(--primary-color)"
                              : "var(--accent-color)",
                        }}
                      >
                        {value}
                      </div>
                    </div>
                    <div className="col-auto">
                      <i
                        className={`fas ${
                          idx === 0 ? "fa-layer-group" : "fa-check-circle"
                        } fa-2x`}
                        style={{
                          color:
                            idx === 0
                              ? "var(--primary-light)"
                              : "var(--accent-light)",
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

      <div
        className="card border-0 shadow-sm mb-3"
        style={{ backgroundColor: "var(--background-white)" }}
      >
        <div className="card-body p-3">
          <div className="row g-2 align-items-start">
            <div className="col-md-4">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Search Sections
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
                  placeholder="Search by name, title or description..."
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
            <div className="col-md-3">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Status
              </label>
              <select
                className="form-select form-select-sm"
                value={statusFilter}
                onChange={(e) => {
                  setStatusFilter(e.target.value);
                  setCurrentPage(1);
                }}
                style={{
                  backgroundColor: "var(--input-bg)",
                  borderColor: "var(--input-border)",
                  color: "var(--input-text)",
                }}
              >
                <option value="">All Status</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            <div className="col-md-3">
              <label
                className="form-label small fw-semibold mb-1"
                style={{ color: "var(--text-muted)" }}
              >
                Items per page
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
                    {size} per page
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>
      </div>

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
              <i className="fas fa-layer-group me-2"></i>
              Section Catalog
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
                    <th
                      className="text-center small fw-semibold"
                      style={{ width: "4%" }}
                    >
                      #
                    </th>
                    <th
                      className="text-center small fw-semibold"
                      style={{ width: "5%" }}
                    >
                      Order
                    </th>
                    <th className="small fw-semibold" style={{ width: "15%" }}>
                      Name
                    </th>
                    <th className="small fw-semibold" style={{ width: "20%" }}>
                      Title
                    </th>
                    <th className="small fw-semibold" style={{ width: "15%" }}>
                      Source
                    </th>
                    <th
                      className="small fw-semibold text-center"
                      style={{ width: "8%" }}
                    >
                      Products
                    </th>
                    <th
                      className="small fw-semibold text-center"
                      style={{ width: "8%" }}
                    >
                      Style
                    </th>
                    <th
                      className="small fw-semibold text-center"
                      style={{ width: "8%" }}
                    >
                      Status
                    </th>
                    <th
                      className="text-center small fw-semibold"
                      style={{ width: "17%" }}
                    >
                      Actions
                    </th>
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
                  Fetching sections data...
                </span>
              </div>
            </div>
          ) : sections.length === 0 ? (
            <EmptyState
              onAddSection={handleNewSection}
              isActionDisabled={isActionDisabled}
              hasFilters={!!(searchTerm || statusFilter)}
            />
          ) : (
            <div className="table-responsive">
              <table className="table table-striped table-hover mb-0">
                <thead style={{ backgroundColor: "var(--background-light)" }}>
                  <tr>
                    <th
                      className="text-center small fw-semibold"
                      style={{ width: "4%" }}
                    >
                      #
                    </th>
                    <th
                      className="text-center small fw-semibold"
                      style={{ width: "5%" }}
                    >
                      Order
                    </th>
                    <th className="small fw-semibold" style={{ width: "15%" }}>
                      Name
                    </th>
                    <th className="small fw-semibold" style={{ width: "20%" }}>
                      Title
                    </th>
                    <th className="small fw-semibold" style={{ width: "15%" }}>
                      Source
                    </th>
                    <th
                      className="small fw-semibold text-center"
                      style={{ width: "8%" }}
                    >
                      Products
                    </th>
                    <th
                      className="small fw-semibold text-center"
                      style={{ width: "8%" }}
                    >
                      Style
                    </th>
                    <th
                      className="small fw-semibold text-center"
                      style={{ width: "8%" }}
                    >
                      Status
                    </th>
                    <th
                      className="text-center small fw-semibold"
                      style={{ width: "17%" }}
                    >
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {sections.map((section, index) => {
                    const actualIndex = allSections.findIndex(s => s.id === section.id);
                    return (
                      <tr key={section.id} className="align-middle">
                        <td
                          className="text-center fw-bold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {startIndex + index + 1}
                        </td>
                        <td className="text-center">
                          <div className="d-flex flex-column gap-1 align-items-center">
                            <button
                              className="btn btn-sm btn-outline-secondary p-1"
                              onClick={() => handleMoveUp(section, actualIndex)}
                              disabled={actualIndex === 0 || actionLock}
                              style={{ 
                                fontSize: '0.7rem', 
                                lineHeight: 1,
                                width: '24px',
                                height: '24px',
                                transition: "all 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              <i className="fas fa-chevron-up"></i>
                            </button>
                            <button
                              className="btn btn-sm btn-outline-secondary p-1"
                              onClick={() => handleMoveDown(section, actualIndex)}
                              disabled={actualIndex === allSections.length - 1 || actionLock}
                              style={{ 
                                fontSize: '0.7rem', 
                                lineHeight: 1,
                                width: '24px',
                                height: '24px',
                                transition: "all 0.2s ease-in-out",
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              <i className="fas fa-chevron-down"></i>
                            </button>
                          </div>
                        </td>
                        <td style={{ maxWidth: "200px", overflow: "hidden" }}>
                          <code
                            className="small"
                            style={{
                              color: "var(--text-muted)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={section.name}
                          >
                            {section.name}
                          </code>
                        </td>
                        <td style={{ maxWidth: "250px", overflow: "hidden" }}>
                          <div
                            className="fw-medium"
                            style={{
                              color: "var(--text-primary)",
                              overflow: "hidden",
                              textOverflow: "ellipsis",
                              whiteSpace: "nowrap",
                            }}
                            title={section.title}
                          >
                            {section.title}
                          </div>
                          {section.description && (
                            <div
                              className="small"
                              style={{
                                color: "var(--text-muted)",
                                overflow: "hidden",
                                textOverflow: "ellipsis",
                                whiteSpace: "nowrap",
                              }}
                              title={section.description}
                            >
                              {section.description}
                            </div>
                          )}
                        </td>
                        <td>
                          <span className="badge bg-info">{getSourceLabel(section)}</span>
                        </td>
                        <td
                          className="text-center fw-semibold"
                          style={{ color: "var(--text-primary)" }}
                        >
                          {section.product_count ?? 0}
                        </td>
                        <td className="text-center">
                          <span className="badge bg-secondary text-capitalize">
                            {section.display_style}
                          </span>
                        </td>
                        <td className="text-center">
                          <span
                            className={`badge ${section.is_active ? 'bg-success' : 'bg-secondary'}`}
                          >
                            {section.is_active ? 'Active' : 'Inactive'}
                          </span>
                        </td>
                        <td className="text-center">
                          <div className="d-flex justify-content-center gap-1">
                            <button
                              className="btn btn-success btn-sm text-white"
                              onClick={() => handleToggleActive(section)}
                              disabled={isActionDisabled(section.id)}
                              title={section.is_active ? 'Deactivate' : 'Activate'}
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                transition: "all 0.2s ease-in-out",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow =
                                    "0 4px 8px rgba(0,0,0,0.2)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              {actionLoading === section.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i
                                  className={`fas ${section.is_active ? 'fa-eye-slash' : 'fa-eye'}`}
                                  style={{ fontSize: "0.875rem" }}
                                ></i>
                              )}
                            </button>
                            <button
                              className="btn btn-warning btn-sm text-white"
                              onClick={() => handleEditSection(section)}
                              disabled={isActionDisabled(section.id)}
                              title="Edit"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                transition: "all 0.2s ease-in-out",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow =
                                    "0 4px 8px rgba(0,0,0,0.2)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              {actionLoading === section.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i
                                  className="fas fa-edit"
                                  style={{ fontSize: "0.875rem" }}
                                ></i>
                              )}
                            </button>
                            <button
                              className="btn btn-danger btn-sm text-white"
                              onClick={() => handleDeleteSection(section)}
                              disabled={isActionDisabled(section.id)}
                              title="Delete"
                              style={{
                                width: "32px",
                                height: "32px",
                                borderRadius: "6px",
                                transition: "all 0.2s ease-in-out",
                                padding: 0,
                                display: "flex",
                                alignItems: "center",
                                justifyContent: "center",
                              }}
                              onMouseEnter={(e) => {
                                if (!e.target.disabled) {
                                  e.target.style.transform = "translateY(-1px)";
                                  e.target.style.boxShadow =
                                    "0 4px 8px rgba(0,0,0,0.2)";
                                }
                              }}
                              onMouseLeave={(e) => {
                                e.target.style.transform = "translateY(0)";
                                e.target.style.boxShadow = "none";
                              }}
                            >
                              {actionLoading === section.id ? (
                                <span
                                  className="spinner-border spinner-border-sm"
                                  role="status"
                                ></span>
                              ) : (
                                <i
                                  className="fas fa-trash"
                                  style={{ fontSize: "0.875rem" }}
                                ></i>
                              )}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
        {!loading && sections.length > 0 && (
          <div className="card-footer bg-white border-top px-3 py-2">
            <div className="d-flex flex-column flex-md-row justify-content-between align-items-center gap-2">
              <div className="text-center text-md-start">
                <small style={{ color: "var(--text-muted)" }}>
                  Showing{" "}
                  <span
                    className="fw-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {paginationMeta.from || startIndex + 1}-
                    {paginationMeta.to ||
                      Math.min(
                        startIndex + sections.length,
                        paginationMeta.total
                      )}
                  </span>{" "}
                  of{" "}
                  <span
                    className="fw-semibold"
                    style={{ color: "var(--text-primary)" }}
                  >
                    {paginationMeta.total}
                  </span>{" "}
                  sections
                </small>
              </div>

              <div className="d-flex align-items-center gap-2">
                <button
                  className="btn btn-sm"
                  onClick={() =>
                    setCurrentPage((prev) => Math.max(prev - 1, 1))
                  }
                  disabled={
                    paginationMeta.current_page === 1 || isActionDisabled()
                  }
                  style={{
                    transition: "all 0.2s ease-in-out",
                    border: "2px solid var(--primary-color)",
                    color: "var(--primary-color)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                      e.target.style.backgroundColor = "var(--primary-color)";
                      e.target.style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "var(--primary-color)";
                  }}
                >
                  <i className="fas fa-chevron-left me-1"></i>
                  Previous
                </button>

                <div className="d-none d-md-flex gap-1">
                  {(() => {
                    let pages = [];
                    const maxVisiblePages = 5;
                    const totalPages = paginationMeta.last_page;

                    if (totalPages <= maxVisiblePages) {
                      pages = Array.from(
                        { length: totalPages },
                        (_, i) => i + 1
                      );
                    } else {
                      pages.push(1);
                      let start = Math.max(2, paginationMeta.current_page - 1);
                      let end = Math.min(
                        totalPages - 1,
                        paginationMeta.current_page + 1
                      );

                      if (paginationMeta.current_page <= 2) {
                        end = 4;
                      } else if (
                        paginationMeta.current_page >=
                        totalPages - 1
                      ) {
                        start = totalPages - 3;
                      }

                      if (start > 2) {
                        pages.push("...");
                      }

                      for (let i = start; i <= end; i++) {
                        pages.push(i);
                      }

                      if (end < totalPages - 1) {
                        pages.push("...");
                      }

                      if (totalPages > 1) {
                        pages.push(totalPages);
                      }
                    }

                    return pages.map((page, index) => (
                      <button
                        key={index}
                        className="btn btn-sm"
                        onClick={() => page !== "..." && setCurrentPage(page)}
                        disabled={page === "..." || isActionDisabled()}
                        style={{
                          transition: "all 0.2s ease-in-out",
                          border: `2px solid ${
                            paginationMeta.current_page === page
                              ? "var(--primary-color)"
                              : "var(--input-border)"
                          }`,
                          color:
                            paginationMeta.current_page === page
                              ? "white"
                              : "var(--text-primary)",
                          backgroundColor:
                            paginationMeta.current_page === page
                              ? "var(--primary-color)"
                              : "transparent",
                          minWidth: "40px",
                        }}
                        onMouseEnter={(e) => {
                          if (
                            !e.target.disabled &&
                            paginationMeta.current_page !== page
                          ) {
                            e.target.style.transform = "translateY(-1px)";
                            e.target.style.boxShadow =
                              "0 2px 4px rgba(0,0,0,0.1)";
                            e.target.style.backgroundColor =
                              "var(--primary-color)";
                            e.target.style.color = "white";
                          }
                        }}
                        onMouseLeave={(e) => {
                          if (
                            !e.target.disabled &&
                            paginationMeta.current_page !== page
                          ) {
                            e.target.style.transform = "translateY(0)";
                            e.target.style.boxShadow = "none";
                            e.target.style.backgroundColor = "transparent";
                            e.target.style.color = "var(--text-primary)";
                          }
                        }}
                      >
                        {page}
                      </button>
                    ));
                  })()}
                </div>

                <div className="d-md-none">
                  <small style={{ color: "var(--text-muted)" }}>
                    Page {paginationMeta.current_page} of{" "}
                    {paginationMeta.last_page}
                  </small>
                </div>

                <button
                  className="btn btn-sm"
                  onClick={() =>
                    setCurrentPage((prev) =>
                      Math.min(prev + 1, paginationMeta.last_page)
                    )
                  }
                  disabled={
                    paginationMeta.current_page === paginationMeta.last_page ||
                    isActionDisabled()
                  }
                  style={{
                    transition: "all 0.2s ease-in-out",
                    border: "2px solid var(--primary-color)",
                    color: "var(--primary-color)",
                    backgroundColor: "transparent",
                  }}
                  onMouseEnter={(e) => {
                    if (!e.target.disabled) {
                      e.target.style.transform = "translateY(-1px)";
                      e.target.style.boxShadow = "0 2px 4px rgba(0,0,0,0.1)";
                      e.target.style.backgroundColor = "var(--primary-color)";
                      e.target.style.color = "white";
                    }
                  }}
                  onMouseLeave={(e) => {
                    e.target.style.transform = "translateY(0)";
                    e.target.style.boxShadow = "none";
                    e.target.style.backgroundColor = "transparent";
                    e.target.style.color = "var(--primary-color)";
                  }}
                >
                  Next
                  <i className="fas fa-chevron-right ms-1"></i>
                </button>
              </div>
            </div>
          </div>
        )}
      </div>

      {showSectionForm && (
        <LandingPageSectionFormModal
          isOpen={showSectionForm}
          onClose={() => {
            setShowSectionForm(false);
            setEditingSection(null);
          }}
          onSave={handleSave}
          section={editingSection}
          collections={collections}
        />
      )}

      {/* Toast Container - Render via Portal to ensure it's outside modal stacking context */}
      <Portal>
        <div style={{ zIndex: 100002, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, pointerEvents: 'none' }}>
          <ToastContainer
            position="top-right"
            autoClose={3000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
            theme="light"
          />
        </div>
      </Portal>
    </div>
  );
};

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
          <div className="text-xs fw-semibold text-uppercase mb-1 placeholder-wave">
            <span className="placeholder col-7" style={{ height: 14 }}></span>
          </div>
          <div className="h4 mb-0 fw-bold placeholder-wave">
            <span className="placeholder col-4" style={{ height: 28 }}></span>
          </div>
        </div>
        <div className="col-auto">
          <div className="placeholder-wave">
            <span
              className="placeholder rounded-circle"
              style={{ width: 48, height: 48, borderRadius: "50% !important" }}
            ></span>
          </div>
        </div>
      </div>
    </div>
  </div>
);

const TableRowSkeleton = () => (
  <tr className="align-middle" style={{ height: "70px" }}>
    <td className="text-center">
      <div className="placeholder-wave">
        <span className="placeholder col-4" style={{ height: "20px" }}></span>
      </div>
    </td>
    <td className="text-center">
      <div className="d-flex justify-content-center gap-1">
        {[1, 2].map((item) => (
          <div
            key={item}
            className="placeholder action-placeholder"
            style={{
              width: "24px",
              height: "24px",
              borderRadius: "6px",
            }}
          ></div>
        ))}
      </div>
    </td>
    <td>
      <div className="placeholder-wave">
        <span
          className="placeholder col-8"
          style={{ height: "16px" }}
        ></span>
      </div>
    </td>
    <td>
      <div className="placeholder-wave mb-1">
        <span className="placeholder col-10" style={{ height: "16px" }}></span>
      </div>
      <div className="placeholder-wave">
        <span className="placeholder col-8" style={{ height: "14px" }}></span>
      </div>
    </td>
    <td>
      <div className="placeholder-wave">
        <span className="placeholder col-6" style={{ height: "16px" }}></span>
      </div>
    </td>
    <td>
      <div className="placeholder-wave">
        <span className="placeholder col-4" style={{ height: "16px" }}></span>
      </div>
    </td>
    <td>
      <div className="placeholder-wave">
        <span className="placeholder col-5" style={{ height: "16px" }}></span>
      </div>
    </td>
    <td>
      <div className="placeholder-wave">
        <span className="placeholder col-5" style={{ height: "16px" }}></span>
      </div>
    </td>
    <td className="text-center">
      <div className="d-flex justify-content-center gap-1">
        {[1, 2, 3].map((item) => (
          <div
            key={item}
            className="placeholder action-placeholder"
            style={{
              width: "32px",
              height: "32px",
              borderRadius: "6px",
            }}
          ></div>
        ))}
      </div>
    </td>
  </tr>
);

const EmptyState = ({ onAddSection, isActionDisabled, hasFilters }) => (
  <div className="text-center py-5">
    <div className="mb-3">
      <i
        className="fas fa-layer-group fa-3x"
        style={{ color: "var(--text-muted)", opacity: 0.5 }}
      ></i>
    </div>
    <h5 className="mb-2" style={{ color: "var(--text-muted)" }}>
      No Sections Found
    </h5>
    <p className="mb-3 small" style={{ color: "var(--text-muted)" }}>
      {hasFilters
        ? "Try adjusting your filters to see more sections."
        : "Start by adding your first landing page section to organize your content."}
    </p>
    {!hasFilters && onAddSection && (
      <button
        className="btn btn-sm btn-primary text-white"
        onClick={onAddSection}
        disabled={isActionDisabled?.()}
        style={{ transition: "all 0.2s ease-in-out", borderWidth: "2px", borderRadius: "4px" }}
        onMouseEnter={(e) => {
          if (!e.target.disabled) {
            e.target.style.transform = "translateY(-1px)";
            e.target.style.boxShadow = "0 4px 8px rgba(0,0,0,0.1)";
          }
        }}
        onMouseLeave={(e) => {
          e.target.style.transform = "translateY(0)";
          e.target.style.boxShadow = "none";
        }}
      >
        <i className="fas fa-plus me-1"></i>
        Add Section
      </button>
    )}
  </div>
);

export default LandingPageSections;

