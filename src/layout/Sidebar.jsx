// src/layout/Sidebar.jsx
import React, { useMemo, useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { useLocation, Link } from "react-router-dom";

const Sidebar = ({ onCloseSidebar }) => {
  const { user, admin, loading, isAuthenticated } = useAuth();
  const location = useLocation();
  // Initialize expanded state based on current route
  const isOnProductsRoute = location.pathname.startsWith('/admin/products');
  const isOnCustomersRoute = location.pathname.startsWith('/admin/customers');
  const isOnLandingPageSectionsRoute = location.pathname === '/admin/landing-page-sections';
  const [expandedItems, setExpandedItems] = useState({
    products: isOnProductsRoute && !isOnLandingPageSectionsRoute,
    customers: isOnCustomersRoute && !isOnLandingPageSectionsRoute,
  });

  // Auto-expand/collapse parent based on current route
  useEffect(() => {
    if (isOnLandingPageSectionsRoute) {
      // Collapse Products and Customers menus when on Landing Page Sections
      setExpandedItems(prev => ({ ...prev, products: false, customers: false }));
    } else if (isOnProductsRoute) {
      // Expand Products menu when on Products routes
      setExpandedItems(prev => ({ ...prev, products: true, customers: false }));
    } else if (isOnCustomersRoute) {
      // Expand Customers menu when on Customers routes
      setExpandedItems(prev => ({ ...prev, products: false, customers: true }));
    }
  }, [location.pathname, isOnProductsRoute, isOnCustomersRoute, isOnLandingPageSectionsRoute]);
  
  // Check if user is admin - STATIC CHECK (no DB lookup needed)
  // If we're authenticated and on admin routes, assume admin until proven otherwise
  const currentUser = user || admin;
  const hasToken = Boolean(localStorage.getItem('token') || localStorage.getItem('admin_token'));
  const isOnAdminRoute = location.pathname.startsWith('/admin');
  
  // Determine if admin: check user data if available, otherwise assume admin if authenticated on admin routes
  const isAdmin = useMemo(() => {
    if (currentUser) {
      // If user data is loaded, check role/type/username
      return currentUser.role === 'admin' || 
             currentUser.type === 'admin' || 
             currentUser.username === 'admin@admin.com';
    }
    // If user data not loaded yet but we're authenticated on admin routes, assume admin
    // This allows immediate display of "System Administrator" without waiting for user data
    return hasToken && isOnAdminRoute && !loading;
  }, [currentUser, hasToken, isOnAdminRoute, loading]);
  
  // Static display name - admin is always "System Administrator" (no loading state), personnel loads their name
  const displayName = isAdmin ? "System Administrator" : (currentUser?.name || currentUser?.username || "User");
  const displayRole = isAdmin ? "System Administrator" : (currentUser?.position || currentUser?.role || "User");

  const isActiveLink = (href) => {
    return location.pathname === href;
  };

  const closeSidebarOnMobile = () => {
    if (window.innerWidth < 768 && onCloseSidebar) {
      onCloseSidebar();
    }
  };

  const handleLinkClick = (href) => {
    closeSidebarOnMobile();
    // Collapse Products menu when clicking Landing Page Sections
    if (href === '/admin/landing-page-sections') {
      setExpandedItems(prev => ({ ...prev, products: false, customers: false }));
    }
  };

  // Toggle expanded state for nested items
  const toggleExpanded = (itemKey) => {
    setExpandedItems(prev => ({
      ...prev,
      [itemKey]: !prev[itemKey]
    }));
  };

  // Admin menu items with nested structure
  const adminMenuItems = [
    {
      heading: "Core",
      items: [
        {
          icon: "fas fa-tachometer-alt",
          label: "Dashboard",
          href: "/admin/dashboard",
        },
      ],
    },
    {
      heading: "Sales & Orders",
      items: [
        {
          icon: "fas fa-file-invoice",
          label: "Orders",
          href: "/admin/orders",
        },
      ],
    },
    {
      heading: "Product Management",
      items: [
            {
              icon: "fas fa-box",
              label: "Products",
              href: "/admin/products",
              hasChildren: true,
              children: [
            {
              icon: "fas fa-list",
              label: "All Products",
              href: "/admin/products",
            },
            {
              icon: "fas fa-tags",
              label: "Product Categories",
              href: "/admin/products/categories",
            },
            {
              icon: "fas fa-layer-group",
              label: "Collections",
              href: "/admin/products/collections",
            },
          ],
        },
        {
          icon: "fas fa-columns",
          label: "Landing Page Sections",
          href: "/admin/landing-page-sections",
        },
      ],
    },
    {
      heading: "Customer Management",
      items: [
        {
          icon: "fas fa-users",
          label: "Customers",
          href: "/admin/customers",
          hasChildren: true,
          children: [
            {
              icon: "fas fa-list",
              label: "All Customers",
              href: "/admin/customers",
            },
            {
              icon: "fas fa-clock",
              label: "Time Logging",
              href: "/admin/customers/time-logs",
            },
          ],
        },
      ],
    },
    {
      heading: "Settings",
      items: [
        {
          icon: "fas fa-user",
          label: "Profile",
          href: "/admin/profile",
        },
        {
          icon: "fas fa-cog",
          label: "Settings",
          href: "/admin/settings",
        },
      ],
    },
  ];

  const renderMenuSection = (section, index) => (
    <React.Fragment key={index}>
      <div className="sb-sidenav-menu-heading">{section.heading}</div>
      {section.items.map((item, itemIndex) => {
        const isActive = isActiveLink(item.href) || (item.children && item.children.some(child => isActiveLink(child.href)));
        const isExpanded = expandedItems[item.label.toLowerCase().replace(/\s+/g, '')] || false;
        const itemKey = item.label.toLowerCase().replace(/\s+/g, '');

        if (item.hasChildren && item.children) {
          return (
            <React.Fragment key={itemIndex}>
              <a
                className={`nav-link ${isActive ? "active" : ""}`}
                href="#"
                onClick={(e) => {
                  e.preventDefault();
                  toggleExpanded(itemKey);
                }}
              >
                <div className="sb-nav-link-icon">
                  <i className={item.icon}></i>
                </div>
                {item.label}
                <div className={`sb-sidenav-collapse-arrow ms-auto ${isExpanded ? 'expanded' : ''}`}>
                  <i className="fas fa-chevron-right small"></i>
                </div>
              </a>
              <div className={`sb-sidenav-menu-nested ${isExpanded ? 'show' : ''}`}>
                {item.children.map((child, childIndex) => {
                  const isChildActive = isActiveLink(child.href);
                  return (
                      <Link
                        key={childIndex}
                        className={`nav-link ${isChildActive ? "active" : ""}`}
                        to={child.href}
                        onClick={() => handleLinkClick(child.href)}
                      >
                        <div className="sb-nav-link-icon">
                          <i className={child.icon}></i>
                        </div>
                        {child.label}
                        {isChildActive && (
                          <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                            <i className="fas fa-chevron-right small"></i>
                          </span>
                        )}
                      </Link>
                  );
                })}
              </div>
            </React.Fragment>
          );
        }

        return (
          <Link
            key={itemIndex}
            className={`nav-link ${isActive ? "active" : ""}`}
            to={item.href}
            onClick={() => handleLinkClick(item.href)}
          >
            <div className="sb-nav-link-icon">
              <i className={item.icon}></i>
            </div>
            {item.label}
            {isActive && (
              <span className="position-absolute top-50 end-0 translate-middle-y me-3">
                <i className="fas fa-chevron-right small"></i>
              </span>
            )}
          </Link>
        );
      })}
    </React.Fragment>
  );

  return (
    <nav className="sb-sidenav accordion sb-sidenav-dark" id="sidenavAccordion">
      <div className="sb-sidenav-menu">
        <div className="nav">
          {adminMenuItems.map(renderMenuSection)}
        </div>
      </div>

      <div className="sb-sidenav-footer">
        <div className="small">Logged in as:</div>
        <span className="user-name">{displayName}</span>
        <div className="small text-muted">{displayRole}</div>
      </div>
    </nav>
  );
};

export default Sidebar;

