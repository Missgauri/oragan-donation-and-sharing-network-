import React, { useState, useEffect } from 'react';
import { Search, Filter, MapPin, Activity, Droplet } from 'lucide-react';
import { supabase } from '../supabaseClient';
import './Find.css';

const MOCK_RESULTS = [
  { id: 1, organ: 'Kidney', bloodType: 'O+', location: 'Delhi, IN', urgency: 'High', dateAdded: '2023-10-25' },
  { id: 2, organ: 'Liver (Partial)', bloodType: 'A-', location: 'Mumbai, MH', urgency: 'Medium', dateAdded: '2023-10-26' },
  { id: 3, organ: 'Heart', bloodType: 'AB+', location: 'Bangalore, KA', urgency: 'Critical', dateAdded: '2023-10-27' },
  { id: 4, organ: 'Lungs', bloodType: 'O-', location: 'Chennai, TN', urgency: 'High', dateAdded: '2023-10-28' },
];

const Find = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [bloodTypeFilter, setBloodTypeFilter] = useState('All');
  const [organFilter, setOrganFilter] = useState('All');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState(MOCK_RESULTS);
  const [selectedDetails, setSelectedDetails] = useState(null);

  // Load organs from DB on mount
  useEffect(() => {
    const loadOrgans = async () => {
      try {
        const { data, error } = await supabase.from('organs').select('*');
        if (error) throw error;
        if (data && data.length > 0) {
          setResults(data);
        }
      } catch (err) {
        console.warn("Could not load from Supabase, using mock data:", err);
      }
    };
    loadOrgans();
  }, []);

  const handleSearch = async (e) => {
    e.preventDefault();
    setIsSearching(true);
    
    try {
      const { data, error } = await supabase.from('organs').select('*');
      if (error) throw error;
      
      if (data && data.length > 0) {
        setResults(data);
      }
    } catch (err) {
      console.warn("Using mock data. (Supabase connection missing or empty)", err);
      // Fallback to mock results already in state
    } finally {
      setIsSearching(false);
    }
  };

  const filteredResults = results.filter(item => {
    const matchSearch = item.location.toLowerCase().includes(searchTerm.toLowerCase()) || item.organ.toLowerCase().includes(searchTerm.toLowerCase());
    const matchBlood = bloodTypeFilter === 'All' || item.bloodType === bloodTypeFilter;
    const matchOrgan = organFilter === 'All' || item.organ === organFilter;
    return matchSearch && matchBlood && matchOrgan;
  });

  return (
    <div className="find-page container">
      <div className="find-header text-center">
        <Search size={48} className="header-icon" />
        <h1 className="page-title">Organ & Tissue Finder</h1>
        <p className="page-subtitle">Search the national database for compatible life-saving matches.</p>
      </div>

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
                <option value="A+">A+</option>
                <option value="A-">A-</option>
                <option value="B+">B+</option>
                <option value="B-">B-</option>
                <option value="O+">O+</option>
                <option value="O-">O-</option>
                <option value="AB+">AB+</option>
                <option value="AB-">AB-</option>
              </select>
            </div>
            
            <button type="submit" className="btn btn-primary search-btn">
              {isSearching ? 'Searching...' : 'Search Database'}
            </button>
          </div>
        </form>
      </div>

      <div className="results-section">
        <div className="results-header">
          <h2>Available Matches <span className="badge">{isSearching ? 0 : filteredResults.length}</span></h2>
        </div>
        
        {isSearching ? (
          <div className="loading-state glass-panel">
            <Activity size={40} className="spinner" />
            <p>Scanning the registry...</p>
          </div>
        ) : filteredResults.length > 0 ? (
          <div className="results-grid">
            {filteredResults.map(result => (
              <div key={result.id} className="result-card glass-panel">
                <div className="card-header">
                  <h3>{result.organ}</h3>
                  <span className={`urgency-badge ${result.urgency.toLowerCase()}`}>
                    {result.urgency} Priority
                  </span>
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
                  <button className="btn btn-outline btn-sm" onClick={() => setSelectedDetails(result)}>View Details</button>
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

      {/* Modal Popup */}
      {selectedDetails && (
        <div className="modal-backdrop" onClick={() => setSelectedDetails(null)}>
          <div className="modal-content glass-panel" onClick={e => e.stopPropagation()}>
            <h2>{selectedDetails.organ} Details</h2>
            <div className="modal-body">
              <p><strong>Blood Type:</strong> <span className="highlight-text">{selectedDetails.bloodType}</span></p>
              <p><strong>Location:</strong> {selectedDetails.location}</p>
              <p><strong>Urgency:</strong> <span className={`urgency-badge ${selectedDetails.urgency.toLowerCase()}`}>{selectedDetails.urgency}</span></p>
              <p><strong>Date Added:</strong> {selectedDetails.dateAdded}</p>
              <hr />
              <p className="text-muted">This organ is currently available in the national registry. Authorized medical professionals may initiate a secure matching request pending verification.</p>
            </div>
            <div className="modal-actions">
              <button className="btn btn-primary" onClick={() => { alert('Match Request securely sent to regional coordinator.'); setSelectedDetails(null); }}>Initiate Match Request</button>
              <button className="btn btn-outline" onClick={() => setSelectedDetails(null)}>Close</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Find;
