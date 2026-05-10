import React, { useState } from 'react';
import { Search, Filter, MapPin, Activity, Droplet } from 'lucide-react';
import { useOrgans }      from '../hooks/useOrgans';
import { filterOrgans }   from '../utils/filterOrgans';
import UrgencyBadge       from '../components/ui/UrgencyBadge';
import Modal              from '../components/ui/Modal';
import './Find.css';

const Find = () => {
  const { organs, isLoading, reload } = useOrgans();

  const [searchTerm,      setSearchTerm]      = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [organFilter,     setOrganFilter]     = useState('All');
  const [selectedDetails, setSelectedDetails] = useState(null);

  const filteredResults = filterOrgans(organs, searchTerm, bloodTypeFilter, organFilter);

  const handleSearch = (e) => {
    e.preventDefault();
    reload();
  };

  return (
    <div className="find-page container">
      {/* Header */}
      <div className="find-header text-center">
        <Search size={48} className="header-icon" />
        <h1 className="page-title">Organ &amp; Tissue Finder</h1>
        <p className="page-subtitle">Search the national database for compatible life-saving matches.</p>
      </div>

      {/* Search & Filters */}
      <div className="search-section glass-panel">
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-input-wrapper">
            <MapPin size={20} className="input-icon" />
            <input
              type="text"
              placeholder="Search by location or organ..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="filters-wrapper">
            <div className="filter-group">
              <Filter size={18} className="filter-icon" />
              <select value={organFilter} onChange={(e) => setOrganFilter(e.target.value)}>
                <option value="All">All Organs</option>
                <option value="Kidney">Kidney</option>
                <option value="Liver (Partial)">Liver</option>
                <option value="Heart">Heart</option>
                <option value="Lungs">Lungs</option>
              </select>
            </div>

            <div className="filter-group">
              <Droplet size={18} className="filter-icon" />
              <select value={bloodTypeFilter} onChange={(e) => setBloodTypeFilter(e.target.value)}>
                <option value="All">All Blood Types</option>
                {['A+','A-','B+','B-','O+','O-','AB+','AB-'].map((bt) => (
                  <option key={bt} value={bt}>{bt}</option>
                ))}
              </select>
            </div>

            <button type="submit" className="btn btn-primary search-btn">
              {isLoading ? 'Searching...' : 'Search Database'}
            </button>
          </div>
        </form>
      </div>

      {/* Results */}
      <div className="results-section">
        <div className="results-header">
          <h2>
            Available Matches{' '}
            <span className="badge">{isLoading ? 0 : filteredResults.length}</span>
          </h2>
        </div>

        {isLoading ? (
          <div className="loading-state glass-panel">
            <Activity size={40} className="spinner" />
            <p>Scanning the registry...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="results-grid">
            {filteredResults.map((result) => (
              <div key={result.id} className="result-card glass-panel">
                <div className="card-header">
                  <h3>{result.organ}</h3>
                  <UrgencyBadge urgency={result.urgency} />
                </div>
                <div className="card-body">
                  <div className="info-row">
                    <Droplet size={16} />
                    <span>Blood Type: <strong>{result.bloodType}</strong></span>
                  </div>
                  <div className="info-row">
                    <MapPin size={16} />
                    <span>{result.location}</span>
                  </div>
                </div>
                <div className="card-footer">
                  <span className="date-added">Added: {result.dateAdded}</span>
                  <button
                    className="btn btn-outline btn-sm"
                    onClick={() => setSelectedDetails(result)}
                  >
                    View Details
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="empty-state glass-panel">
            <Search size={40} className="empty-icon" />
            <h3>No Exact Matches Found</h3>
            <p>Try adjusting your filters or expanding your search criteria.</p>
          </div>
        )}
      </div>

      {/* Organ Detail Modal */}
      {selectedDetails && (
        <Modal onClose={() => setSelectedDetails(null)}>
          <h2>{selectedDetails.organ} Details</h2>
          <div className="modal-body">
            <p>
              <strong>Blood Type:</strong>{' '}
              <span className="highlight-text">{selectedDetails.bloodType}</span>
            </p>
            <p><strong>Location:</strong> {selectedDetails.location}</p>
            <p>
              <strong>Urgency:</strong>{' '}
              <UrgencyBadge urgency={selectedDetails.urgency} />
            </p>
            <p><strong>Date Added:</strong> {selectedDetails.dateAdded}</p>
            <hr />
            <p className="text-muted">
              This organ is currently available in the national registry. Authorized medical
              professionals may initiate a secure matching request pending verification.
            </p>
          </div>
          <div className="modal-actions">
            <button
              className="btn btn-primary"
              onClick={() => {
                alert('Match Request securely sent to regional coordinator.');
                setSelectedDetails(null);
              }}
            >
              Initiate Match Request
            </button>
            <button className="btn btn-outline" onClick={() => setSelectedDetails(null)}>
              Close
            </button>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default Find;
