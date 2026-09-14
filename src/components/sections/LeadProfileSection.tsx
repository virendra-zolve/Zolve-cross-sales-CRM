import React, { useState } from 'react';
import { StudentLead, FundingPlan } from '../../types';

interface LeadProfileSectionProps {
  lead: StudentLead;
  onUpdate: (field: keyof StudentLead, value: any) => void;
  isDirty: boolean;
}

const DEGREE_TYPES = ['Masters', 'Bachelors', 'Diploma', 'Certificate', 'Other'];
const INTAKE_OPTIONS = ['Fall 2024', 'Spring 2025', 'Fall 2025', 'Spring 2026', 'Fall 2026', 'Spring 2027', 'Fall 2027'];
const TESTS = ['IELTS', 'TOEFL', 'PTE', 'GRE', 'GMAT', 'SAT', 'ACT', 'Other'];
const COUNTRIES = [
  'USA', 'Canada', 'UK', 'Australia', 'Germany', 'France', 'Netherlands', 'Switzerland',
  'New Zealand', 'Ireland', 'Singapore', 'Japan', 'South Korea', 'India', 'Other'
];
const UNIVERSITIES_DB = [
  'Harvard University', 'Stanford University', 'MIT', 'Berkeley', 'Oxford', 'Cambridge',
  'Toronto University', 'McGill University', 'LSE', 'Imperial College', 'ETH Zurich',
  'NUS Singapore', 'University of Tokyo', 'Seoul National University'
];
const JOURNEY_STAGES = [
  'Pre-Test', 'Test Preparation', 'Counseling', 'Application', 'Admission Confirmed',
  'Pre-Departure', 'Visa', 'Travel', 'Post-Arrival', 'Other', 'Unknown'
];
const FUNDING_PLANS: FundingPlan[] = ['Will Need Loan', 'Self Fund', 'Unknown'];

export const LeadProfileSection: React.FC<LeadProfileSectionProps> = ({
  lead,
  onUpdate,
}) => {
  const [showCountriesDropdown, setShowCountriesDropdown] = useState(false);
  const [showUniversitiesDropdown, setShowUniversitiesDropdown] = useState(false);
  const [universitySearch, setUniversitySearch] = useState('');
  const [showTestsDropdown, setShowTestsDropdown] = useState(true);
  const [testDates, setTestDates] = useState<Record<string, string>>(
    lead.testsInterestedIn.reduce((acc, test) => ({ ...acc, [test]: '|Yet to Book' }), {})
  );

  // Parse countries as array
  const countriesArray = lead.destinationCountry
    ? lead.destinationCountry.split(',').map(c => c.trim())
    : [];

  const filteredUniversities = UNIVERSITIES_DB.filter(uni =>
    uni.toLowerCase().includes(universitySearch.toLowerCase())
  );

  const handleToggleCountry = (country: string) => {
    const newCountries = countriesArray.includes(country)
      ? countriesArray.filter(c => c !== country)
      : [...countriesArray, country];
    onUpdate('destinationCountry', newCountries.join(', '));
  };

  const handleToggleUniversity = (uni: string) => {
    const current = lead.universitiesOfInterest || [];
    const newUnis = current.includes(uni)
      ? current.filter(u => u !== uni)
      : [...current, uni];
    onUpdate('universitiesOfInterest', newUnis);
    setUniversitySearch('');
  };

  const handleAddCustomUniversity = () => {
    if (universitySearch.trim()) {
      handleToggleUniversity(universitySearch);
    }
  };

  const handleToggleTest = (test: string) => {
    const newTests = lead.testsInterestedIn.includes(test)
      ? lead.testsInterestedIn.filter(t => t !== test)
      : [...lead.testsInterestedIn, test];
    onUpdate('testsInterestedIn', newTests);
  };

  return (
    <div className="space-y-6">
      {/* Basic Info - Compact */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="inline-block px-3 py-1 bg-slate-100 text-slate-700 text-xs font-bold rounded-full mb-4">IDENTITY</div>
        <div className="grid grid-cols-4 gap-2 text-xs">
          <div>
            <label className="text-[10px] text-slate-500 font-medium block mb-1">Lead ID</label>
            <input type="text" disabled value={lead.id} className="w-full p-1.5 bg-slate-100 border border-slate-200 rounded text-slate-600 font-mono text-xs" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-medium block mb-1">Name</label>
            <input type="text" value={lead.studentName} onChange={(e) => onUpdate('studentName', e.target.value)} className="w-full p-1.5 bg-white border border-slate-200 rounded" />
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-medium block mb-1">Mobile</label>
            <div className="flex gap-1">
              <select value={lead.mobileCountryCode} onChange={(e) => onUpdate('mobileCountryCode', e.target.value)} className="w-14 p-1.5 bg-slate-50 border border-slate-200 rounded text-xs">
                <option value="91">+91</option>
                <option value="1">+1</option>
              </select>
              <input type="text" value={lead.mobileNumber} onChange={(e) => onUpdate('mobileNumber', e.target.value)} className="flex-1 p-1.5 bg-white border border-slate-200 rounded font-mono text-xs" />
            </div>
          </div>
          <div>
            <label className="text-[10px] text-slate-500 font-medium block mb-1">Email</label>
            <input type="email" value={lead.email} onChange={(e) => onUpdate('email', e.target.value)} className="w-full p-1.5 bg-white border border-slate-200 rounded font-mono text-xs" />
          </div>
        </div>
      </div>

      {/* Study Plan - Main Focus */}
      <div className="bg-white rounded-lg border border-slate-200 p-4">
        <div className="inline-block px-4 py-2 bg-blue-100 text-blue-700 text-sm font-bold rounded-full mb-4">STUDY PLAN & FUNDING</div>
        
        <div className="space-y-4">
          {/* Row 1: Degree & Program */}
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-slate-600 font-bold block mb-2 uppercase tracking-wide">Degree</label>
              <select value={lead.course.split(' ')[0] || ''} onChange={(e) => onUpdate('course', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm font-medium hover:border-slate-400 focus:outline-none focus:border-blue-500">
                <option value="">Select</option>
                {DEGREE_TYPES.map(dt => <option key={dt} value={dt}>{dt}</option>)}
              </select>
            </div>
            <div>
              <label className="text-xs text-slate-600 font-bold block mb-2 uppercase tracking-wide">Program</label>
              <input type="text" placeholder="CS, MBA..." value={lead.course} onChange={(e) => onUpdate('course', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm hover:border-slate-400 focus:outline-none focus:border-blue-500" />
            </div>
          </div>

          {/* Row 2: Destinations */}
          <div className="pt-4 border-t border-slate-200">
            <div className="inline-block px-3 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full mb-3">DESTINATIONS</div>
            <h4 className="text-lg font-bold text-slate-900 mb-4">Where do they want to go?</h4>
            <div className="grid grid-cols-2 gap-4">
              {/* Countries */}
              <div>
                <label className="text-xs text-slate-600 font-bold block mb-2 uppercase tracking-wide">Countries</label>
                <div className="relative">
                  <button
                    onClick={() => setShowCountriesDropdown(!showCountriesDropdown)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm text-left font-medium text-slate-600 flex justify-between items-center hover:border-slate-400"
                  >
                    <span>{countriesArray.length > 0 ? `${countriesArray.length} selected` : 'Select countries'}</span>
                    <span className="text-xs">▼</span>
                  </button>
                  {showCountriesDropdown && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-slate-200 rounded shadow-lg p-2 max-h-48 overflow-y-auto">
                      {COUNTRIES.map(country => (
                        <button
                          key={country}
                          onClick={() => handleToggleCountry(country)}
                          className={`w-full text-left px-2 py-2 rounded text-xs font-medium transition cursor-pointer ${
                            countriesArray.includes(country)
                              ? 'bg-emerald-100 text-emerald-900'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {country}
                        </button>
                      ))}
                      <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-2 mt-2">
                        <button
                          onClick={() => setShowCountriesDropdown(false)}
                          className="w-full px-2 py-1.5 bg-emerald-600 text-white rounded text-xs font-bold hover:bg-emerald-700 transition cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {countriesArray.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {countriesArray.map(country => (
                      <span key={country} className="inline-flex items-center gap-1 px-2 py-1 bg-emerald-200 text-emerald-900 rounded-full text-xs font-bold">
                        {country}
                        <button onClick={() => handleToggleCountry(country)} className="text-emerald-700 hover:text-emerald-900 cursor-pointer font-bold">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>

              {/* Universities */}
              <div>
                <label className="text-xs text-slate-600 font-bold block mb-2 uppercase tracking-wide">Universities</label>
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search or add"
                    value={universitySearch}
                    onChange={(e) => setUniversitySearch(e.target.value)}
                    onFocus={() => setShowUniversitiesDropdown(true)}
                    className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm hover:border-slate-400 focus:outline-none focus:border-blue-500"
                  />
                  {showUniversitiesDropdown && (
                    <div className="absolute z-10 top-full mt-1 w-full bg-white border border-slate-200 rounded shadow-lg p-2 max-h-48 overflow-y-auto">
                      {filteredUniversities.map(uni => (
                        <button
                          key={uni}
                          onClick={() => handleToggleUniversity(uni)}
                          className={`w-full text-left px-2 py-2 rounded text-xs font-medium transition cursor-pointer ${
                            lead.universitiesOfInterest?.includes(uni)
                              ? 'bg-blue-100 text-blue-900'
                              : 'hover:bg-slate-100 text-slate-700'
                          }`}
                        >
                          {uni}
                        </button>
                      ))}
                      {universitySearch && !filteredUniversities.find(u => u.toLowerCase() === universitySearch.toLowerCase()) && (
                        <button
                          onClick={handleAddCustomUniversity}
                          className="w-full text-left px-2 py-2 rounded text-xs bg-blue-50 text-blue-700 font-bold hover:bg-blue-100 cursor-pointer"
                        >
                          + Add "{universitySearch}"
                        </button>
                      )}
                      <div className="sticky bottom-0 bg-white border-t border-slate-200 pt-2 mt-2">
                        <button
                          onClick={() => setShowUniversitiesDropdown(false)}
                          className="w-full px-2 py-1.5 bg-blue-600 text-white rounded text-xs font-bold hover:bg-blue-700 transition cursor-pointer"
                        >
                          Done
                        </button>
                      </div>
                    </div>
                  )}
                </div>
                {lead.universitiesOfInterest?.length > 0 && (
                  <div className="mt-2 flex flex-wrap gap-1">
                    {lead.universitiesOfInterest.map(uni => (
                      <span key={uni} className="inline-flex items-center gap-1 px-2 py-1 bg-blue-200 text-blue-900 rounded-full text-xs font-bold">
                        {uni}
                        <button onClick={() => handleToggleUniversity(uni)} className="text-blue-700 hover:text-blue-900 cursor-pointer font-bold">✕</button>
                      </span>
                    ))}
                  </div>
                )}
              </div>
            </div>
          </div>
          <div className="pt-4 border-t border-slate-200">
            <div className="inline-block px-3 py-1 bg-purple-100 text-purple-700 text-xs font-bold rounded-full mb-3">JOURNEY</div>
            <h4 className="text-lg font-bold text-slate-900 mb-3">Where are they in the journey?</h4>
            <div className="bg-slate-50 border border-slate-200 rounded-lg p-3">
              {/* Visual Timeline */}
              <div className="flex items-center justify-start text-xs overflow-x-auto pb-2 gap-2">
                {JOURNEY_STAGES.slice(0, -2).map((stage, idx) => {
                  const isActive = lead.journeyStage === stage;
                  const isPassed = JOURNEY_STAGES.slice(0, -2).indexOf(lead.journeyStage) > idx && lead.journeyStage !== 'Unknown' && lead.journeyStage !== 'Other';
                  
                  return (
                    <div key={stage} className="flex items-center gap-2 flex-shrink-0">
                      <button
                        onClick={() => onUpdate('journeyStage', stage)}
                        className={`px-4 py-2 rounded-full font-bold text-xs transition cursor-pointer whitespace-nowrap ${
                          isActive
                            ? 'bg-blue-600 text-white shadow-md'
                            : isPassed
                            ? 'bg-green-200 text-green-800 border border-green-400'
                            : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                        }`}
                      >
                        {stage}
                      </button>
                      {idx < JOURNEY_STAGES.length - 3 && (
                        <div className={`w-3 h-1 ${isPassed ? 'bg-green-400' : isActive ? 'bg-blue-400' : 'bg-slate-300'}`} />
                      )}
                    </div>
                  );
                })}
              </div>
              {/* Other options row */}
              <div className="flex gap-2 mt-3">
                {JOURNEY_STAGES.slice(-2).map(stage => (
                  <button
                    key={stage}
                    onClick={() => onUpdate('journeyStage', stage)}
                    className={`px-4 py-2 rounded text-xs font-bold transition cursor-pointer flex-1 ${
                      lead.journeyStage === stage
                        ? 'bg-slate-600 text-white'
                        : 'bg-white text-slate-600 border border-slate-300 hover:bg-slate-100'
                    }`}
                  >
                    {stage}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Tests with Booking Status Toggle */}
          <div className="pt-4 border-t border-slate-200">
            <div className="inline-block px-3 py-1 bg-orange-100 text-orange-700 text-xs font-bold rounded-full mb-3">TESTS</div>
            <div className="flex items-center justify-between mb-3">
              <h4 className="text-lg font-bold text-slate-900">Which tests are you taking?</h4>
              <button onClick={() => setShowTestsDropdown(!showTestsDropdown)} className="text-sm text-blue-600 font-bold cursor-pointer hover:text-blue-700">
                {showTestsDropdown ? '▲ Hide' : '▼ Show'}
              </button>
            </div>
            
            {showTestsDropdown && (
              <div className="bg-slate-50 border border-slate-200 rounded-lg p-2 mb-3">
                <div className="grid grid-cols-4 gap-2">
                  {TESTS.map(test => (
                    <button
                      key={test}
                      onClick={() => handleToggleTest(test)}
                      className={`px-2.5 py-1.5 rounded text-xs font-semibold transition cursor-pointer ${
                        lead.testsInterestedIn.includes(test)
                          ? 'bg-blue-100 text-blue-900 border border-blue-300'
                          : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
                      }`}
                    >
                      {test}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Test Schedule with Booking Status */}
            {lead.testsInterestedIn.length > 0 && (
              <div className="space-y-2">
                {lead.testsInterestedIn.map((test) => {
                  const bookingStatus = testDates[test]?.split('|')[1]?.trim() || 'Yet to Book';
                  const tentativeDate = testDates[test]?.split('|')[0]?.trim() || '';
                  const isBooked = bookingStatus === 'Booked';
                  
                  return (
                    <div key={test} className="flex items-center gap-3 p-3 bg-slate-50 border border-slate-200 rounded-lg">
                      <div className="flex-1 min-w-0">
                        <div className="font-semibold text-slate-900 text-sm">{test}</div>
                      </div>
                      
                      {/* Booking Status Toggle Switch */}
                      <div className="flex items-center gap-2 flex-shrink-0">
                        <span className={`text-xs font-semibold ${isBooked ? 'text-slate-400' : 'text-slate-700'}`}>
                          Yet to Book
                        </span>
                        <button
                          onClick={() => {
                            const newStatus = isBooked ? 'Yet to Book' : 'Booked';
                            const newValue = tentativeDate ? `${tentativeDate}|${newStatus}` : `|${newStatus}`;
                            setTestDates(prev => ({ ...prev, [test]: newValue }));
                            const updated = lead.academicBackground || {};
                            onUpdate('academicBackground', { ...updated, testDates: { ...testDates, [test]: newValue } });
                          }}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition cursor-pointer ${
                            isBooked ? 'bg-emerald-500' : 'bg-slate-300'
                          }`}
                          title="Toggle booking status"
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition ${
                              isBooked ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                        <span className={`text-xs font-semibold ${isBooked ? 'text-slate-700' : 'text-slate-400'}`}>
                          Booked
                        </span>
                      </div>

                      {/* Tentative Date Input - Only show if "Yet to Book" */}
                      {!isBooked && (
                        <div className="flex-shrink-0">
                          <input
                            type="date"
                            value={tentativeDate}
                            onChange={(e) => {
                              const newValue = `${e.target.value}|${bookingStatus}`;
                              setTestDates(prev => ({ ...prev, [test]: newValue }));
                              const updated = lead.academicBackground || {};
                              onUpdate('academicBackground', { ...updated, testDates: { ...testDates, [test]: newValue } });
                            }}
                            placeholder="Tentative date"
                            className="px-2 py-1 border border-slate-300 rounded text-xs focus:outline-none focus:border-blue-500 w-32"
                          />
                        </div>
                      )}

                      {/* Remove Button */}
                      <button 
                        onClick={() => handleToggleTest(test)} 
                        className="text-red-500 hover:text-red-700 font-bold cursor-pointer flex-shrink-0 px-2 py-1"
                        title="Remove test"
                      >
                        ✕
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* Row 4: Final Country & University */}
          <div className="pt-4 border-t border-slate-200">
            <div className="inline-block px-3 py-1 bg-red-100 text-red-700 text-xs font-bold rounded-full mb-3">DECISIONS</div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-600 font-bold block mb-2 uppercase tracking-wide">Final Country</label>
                <select value={lead.finalCountry || ''} onChange={(e) => onUpdate('finalCountry', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm hover:border-slate-400 focus:outline-none focus:border-blue-500">
                  <option value="">Not Decided</option>
                  {COUNTRIES.map(c => <option key={c} value={c}>{c}</option>)}
                </select>
              </div>
              <div>
                <label className="text-xs text-slate-600 font-bold block mb-2 uppercase tracking-wide">Final University</label>
                <input type="text" placeholder="Not Decided" value={lead.finalUniversity || ''} onChange={(e) => onUpdate('finalUniversity', e.target.value)} className="w-full px-3 py-2 bg-white border border-slate-300 rounded text-sm hover:border-slate-400 focus:outline-none focus:border-blue-500" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
