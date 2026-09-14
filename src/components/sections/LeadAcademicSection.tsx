import React, { useState } from 'react';
import { BookOpen, Award, Briefcase, Zap } from 'lucide-react';
import { StudentLead } from '../../types';

interface LeadAcademicSectionProps {
  lead: StudentLead;
  onUpdate: (field: keyof StudentLead, value: any) => void;
  isDirty: boolean;
}

export const LeadAcademicSection: React.FC<LeadAcademicSectionProps> = ({
  lead,
  onUpdate,
  isDirty,
}) => {
  const [expandedSection, setExpandedSection] = useState<'10th' | '12th' | 'ug' | 'pg' | 'work' | 'tests' | 'achievements' | null>('10th');

  const toggleSection = (section: '10th' | '12th' | 'ug' | 'pg' | 'work' | 'tests' | 'achievements') => {
    setExpandedSection(expandedSection === section ? null : section);
  };

  // Initialize academic data structure if it doesn't exist
  const academicData = lead.academicBackground || {
    tenthGrade: { board: '', schoolName: '', passingYear: '', percentage: '' },
    twelfthGrade: { board: '', schoolName: '', stream: '', passingYear: '', percentage: '' },
    undergraduate: { college: '', degree: '', specialisation: '', startYear: '', graduationYear: '', percentage: '' },
    postgraduate: { college: '', degree: '', specialisation: '', startYear: '', graduationYear: '', percentage: '' },
    workExperience: { totalExperience: '', currentEmployer: '', role: '', details: '' },
    tests: {
      english: { testName: '', score: '', testDate: '' },
      aptitude: { testName: '', score: '', testDate: '' }
    },
    achievements: ''
  };

  const updateAcademicData = (section: string, field: string, value: string) => {
    const updated = JSON.parse(JSON.stringify(academicData));
    if (section === 'english') updated.tests.english[field] = value;
    else if (section === 'aptitude') updated.tests.aptitude[field] = value;
    else if (section === 'work') updated.workExperience[field] = value;
    else if (section === 'achievements') updated.achievements = value;
    else updated[section][field] = value;
    onUpdate('academicBackground', updated);
  };

  return (
    <div className="space-y-4">
      <div className="bg-orange-50 rounded-lg border border-orange-200 p-4">
        <p className="text-xs text-orange-700 font-semibold">
          Indian Academic Background — Complete educational history from 10th grade onwards. Fields are specific to Indian education system.
        </p>
      </div>

      {/* 10th Grade */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('10th')}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-200"
        >
          <h3 className="text-sm font-bold text-slate-900">10th Grade</h3>
          <span className="text-slate-400">{expandedSection === '10th' ? '−' : '+'}</span>
        </button>
        {expandedSection === '10th' && (
          <div className="p-4 space-y-3 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Board</label>
                <input 
                  type="text" 
                  placeholder="CBSE / ICSE / State Board" 
                  value={academicData.tenthGrade.board}
                  onChange={(e) => updateAcademicData('tenthGrade', 'board', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">School Name</label>
                <input 
                  type="text" 
                  placeholder="School name" 
                  value={academicData.tenthGrade.schoolName}
                  onChange={(e) => updateAcademicData('tenthGrade', 'schoolName', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Passing Year</label>
                <input 
                  type="number" 
                  placeholder="2018" 
                  value={academicData.tenthGrade.passingYear}
                  onChange={(e) => updateAcademicData('tenthGrade', 'passingYear', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Percentage / CGPA</label>
                <input 
                  type="text" 
                  placeholder="88%" 
                  value={academicData.tenthGrade.percentage}
                  onChange={(e) => updateAcademicData('tenthGrade', 'percentage', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* 12th Grade */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('12th')}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-200"
        >
          <h3 className="text-sm font-bold text-slate-900">12th Grade</h3>
          <span className="text-slate-400">{expandedSection === '12th' ? '−' : '+'}</span>
        </button>
        {expandedSection === '12th' && (
          <div className="p-4 space-y-3 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Board</label>
                <input 
                  type="text" 
                  placeholder="CBSE / ICSE / State Board" 
                  value={academicData.twelfthGrade.board}
                  onChange={(e) => updateAcademicData('twelfthGrade', 'board', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">School Name</label>
                <input 
                  type="text" 
                  placeholder="School name" 
                  value={academicData.twelfthGrade.schoolName}
                  onChange={(e) => updateAcademicData('twelfthGrade', 'schoolName', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Stream</label>
                <select 
                  value={academicData.twelfthGrade.stream}
                  onChange={(e) => updateAcademicData('twelfthGrade', 'stream', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                >
                  <option value="">Select Stream</option>
                  <option value="Science">Science</option>
                  <option value="Commerce">Commerce</option>
                  <option value="Arts">Arts</option>
                </select>
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Passing Year</label>
                <input 
                  type="number" 
                  placeholder="2020" 
                  value={academicData.twelfthGrade.passingYear}
                  onChange={(e) => updateAcademicData('twelfthGrade', 'passingYear', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Percentage / CGPA</label>
                <input 
                  type="text" 
                  placeholder="91%" 
                  value={academicData.twelfthGrade.percentage}
                  onChange={(e) => updateAcademicData('twelfthGrade', 'percentage', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Undergraduate */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('ug')}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-200"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <BookOpen className="w-4 h-4" />
            Undergraduate (UG)
          </h3>
          <span className="text-slate-400">{expandedSection === 'ug' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'ug' && (
          <div className="p-4 space-y-3 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 font-medium block mb-1">College / University</label>
                <input 
                  type="text" 
                  placeholder="ABC College / Delhi University" 
                  value={academicData.undergraduate.college}
                  onChange={(e) => updateAcademicData('undergraduate', 'college', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Degree</label>
                <input 
                  type="text" 
                  placeholder="B.Tech / B.Sc / B.A" 
                  value={academicData.undergraduate.degree}
                  onChange={(e) => updateAcademicData('undergraduate', 'degree', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Specialisation / Major</label>
                <input 
                  type="text" 
                  placeholder="Computer Science / Electronics" 
                  value={academicData.undergraduate.specialisation}
                  onChange={(e) => updateAcademicData('undergraduate', 'specialisation', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Start Year</label>
                <input 
                  type="number" 
                  placeholder="2021" 
                  value={academicData.undergraduate.startYear}
                  onChange={(e) => updateAcademicData('undergraduate', 'startYear', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Graduation Year</label>
                <input 
                  type="number" 
                  placeholder="2025" 
                  value={academicData.undergraduate.graduationYear}
                  onChange={(e) => updateAcademicData('undergraduate', 'graduationYear', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Percentage / CGPA</label>
                <input 
                  type="text" 
                  placeholder="8.4" 
                  value={academicData.undergraduate.percentage}
                  onChange={(e) => updateAcademicData('undergraduate', 'percentage', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Postgraduate */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('pg')}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-200"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Postgraduate (PG) — Optional
          </h3>
          <span className="text-slate-400">{expandedSection === 'pg' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'pg' && (
          <div className="p-4 space-y-3 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 font-medium block mb-1">College / University</label>
                <input 
                  type="text" 
                  placeholder="XYZ University" 
                  value={academicData.postgraduate.college}
                  onChange={(e) => updateAcademicData('postgraduate', 'college', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Degree</label>
                <input 
                  type="text" 
                  placeholder="MBA / M.Tech / M.Sc" 
                  value={academicData.postgraduate.degree}
                  onChange={(e) => updateAcademicData('postgraduate', 'degree', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Specialisation / Major</label>
                <input 
                  type="text" 
                  placeholder="Finance / AI" 
                  value={academicData.postgraduate.specialisation}
                  onChange={(e) => updateAcademicData('postgraduate', 'specialisation', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Start Year</label>
                <input 
                  type="number" 
                  placeholder="2025" 
                  value={academicData.postgraduate.startYear}
                  onChange={(e) => updateAcademicData('postgraduate', 'startYear', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Graduation Year</label>
                <input 
                  type="number" 
                  placeholder="2027" 
                  value={academicData.postgraduate.graduationYear}
                  onChange={(e) => updateAcademicData('postgraduate', 'graduationYear', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Percentage / CGPA</label>
                <input 
                  type="text" 
                  placeholder="8.1" 
                  value={academicData.postgraduate.percentage}
                  onChange={(e) => updateAcademicData('postgraduate', 'percentage', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Work Experience */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('work')}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-200"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Briefcase className="w-4 h-4" />
            Work Experience
          </h3>
          <span className="text-slate-400">{expandedSection === 'work' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'work' && (
          <div className="p-4 space-y-3 bg-slate-50">
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Total Experience</label>
                <input 
                  type="text" 
                  placeholder="2 years" 
                  value={academicData.workExperience.totalExperience}
                  onChange={(e) => updateAcademicData('work', 'totalExperience', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div>
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Current / Last Employer</label>
                <input 
                  type="text" 
                  placeholder="TCS / Google / Startup" 
                  value={academicData.workExperience.currentEmployer}
                  onChange={(e) => updateAcademicData('work', 'currentEmployer', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Role</label>
                <input 
                  type="text" 
                  placeholder="Software Engineer / Senior Analyst" 
                  value={academicData.workExperience.role}
                  onChange={(e) => updateAcademicData('work', 'role', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
              <div className="col-span-2">
                <label className="text-[11px] text-slate-500 font-medium block mb-1">Experience Details</label>
                <textarea 
                  placeholder="Describe your roles, responsibilities, achievements..." 
                  rows={3} 
                  value={academicData.workExperience.details}
                  onChange={(e) => updateAcademicData('work', 'details', e.target.value)}
                  className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                />
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Tests */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('tests')}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-200"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Zap className="w-4 h-4" />
            Tests (English & Aptitude)
          </h3>
          <span className="text-slate-400">{expandedSection === 'tests' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'tests' && (
          <div className="p-4 space-y-4 bg-slate-50">
            <div>
              <p className="text-xs font-bold text-slate-700 mb-3">English Language Tests (IELTS, TOEFL, PTE)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Test Name</label>
                  <select 
                    value={academicData.tests.english.testName}
                    onChange={(e) => updateAcademicData('english', 'testName', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Select Test</option>
                    <option value="IELTS">IELTS</option>
                    <option value="TOEFL">TOEFL</option>
                    <option value="PTE">PTE</option>
                    <option value="Not taken">Not taken</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Score</label>
                  <input 
                    type="text" 
                    placeholder="7.5" 
                    value={academicData.tests.english.score}
                    onChange={(e) => updateAcademicData('english', 'score', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Test Date</label>
                  <input 
                    type="date" 
                    value={academicData.tests.english.testDate}
                    onChange={(e) => updateAcademicData('english', 'testDate', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                  />
                </div>
              </div>
            </div>

            <div className="border-t border-slate-200 pt-4">
              <p className="text-xs font-bold text-slate-700 mb-3">Aptitude Tests (GRE, GMAT)</p>
              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Test Name</label>
                  <select 
                    value={academicData.tests.aptitude.testName}
                    onChange={(e) => updateAcademicData('aptitude', 'testName', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
                  >
                    <option value="">Select Test</option>
                    <option value="GRE">GRE</option>
                    <option value="GMAT">GMAT</option>
                    <option value="Not taken">Not taken</option>
                  </select>
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Score</label>
                  <input 
                    type="text" 
                    placeholder="320" 
                    value={academicData.tests.aptitude.score}
                    onChange={(e) => updateAcademicData('aptitude', 'score', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                  />
                </div>
                <div>
                  <label className="text-[11px] text-slate-500 font-medium block mb-1">Test Date / Planned</label>
                  <input 
                    type="date" 
                    value={academicData.tests.aptitude.testDate}
                    onChange={(e) => updateAcademicData('aptitude', 'testDate', e.target.value)}
                    className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm" 
                  />
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Achievements */}
      <div className="bg-white rounded-xl border border-slate-200 overflow-hidden shadow-xs">
        <button
          onClick={() => toggleSection('achievements')}
          className="w-full px-4 py-3 flex items-center justify-between bg-slate-50 hover:bg-slate-100 cursor-pointer transition-colors border-b border-slate-200"
        >
          <h3 className="text-sm font-bold text-slate-900 flex items-center gap-2">
            <Award className="w-4 h-4" />
            Achievements & Honors
          </h3>
          <span className="text-slate-400">{expandedSection === 'achievements' ? '−' : '+'}</span>
        </button>
        {expandedSection === 'achievements' && (
          <div className="p-4 space-y-3 bg-slate-50">
            <textarea
              placeholder="Scholarships, awards, publications, certifications, competitions won, research projects, etc."
              rows={4}
              value={academicData.achievements}
              onChange={(e) => updateAcademicData('achievements', '', e.target.value)}
              className="w-full p-2 bg-white border border-slate-200 rounded-lg text-sm"
            />
          </div>
        )}
      </div>
    </div>
  );
};
