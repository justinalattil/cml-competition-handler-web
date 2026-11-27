import React, { useState, useEffect, useMemo } from 'react';
import { 
  Trophy, Users, UserPlus, Award, FileText, Settings as SettingsIcon, 
  Plus, Trash2, Edit2, Search, Check, AlertTriangle, ShieldAlert,
  Printer, Download, Upload, Moon, Sun, RefreshCw, Layers, Hash, XCircle, Key, Eye, GitMerge, Filter, ChevronDown, ClipboardList
} from 'lucide-react';
import cmlLogo from './assets/logo.png';
import { loadDbFromSupabase, saveDbToSupabase, getSupabaseConfig } from './supabaseClient';

// --- Constants ---
const PARISHES = [
  "കണിയാരം",
  "ടൌൺ ചർച്ച്",
  "കുറ്റിമൂല",
  "തലപ്പുഴ",
  "പുതിയിടം",
  "ബോയ്സ്ടൌൺ",
  "പാറത്തോട്ടം",
  "ഏലപ്പീടിക",
  "പേരിയ",
  "ആലാറ്റിൽ",
  "വാളാട്",
  "വലിയകൊല്ലി",
  "പ്രശാന്തിഗിരി",
  "യവനാർകുളം",
  "പോരൂർ",
  "മുതിരേരി",
  "കരിമാനി",
  "തവിഞ്ഞാൽ"
];

const AGE_GROUPS = {
  sub_junior: "സബ് ജൂനിയർ (Sub-Junior)",
  junior: "ജൂനിയർ (Junior)",
  senior: "സീനിയർ (Senior)",
  super_senior: "സൂപ്പർ സീനിയർ (Super Senior)",
  elders: "എൽഡേഴ്സ് (Elders)"
};

const AGE_GROUPS_SHORT_ENG = {
  sub_junior: "Sub-Junior",
  junior: "Junior",
  senior: "Senior",
  super_senior: "Super Senior",
  elders: "Elders"
};

const DEFAULT_DOB_RANGES = {
  sub_junior: { start: "2017-01-01", end: "2019-12-31" },
  junior: { start: "2014-01-01", end: "2016-12-31" },
  senior: { start: "2011-01-01", end: "2013-12-31" },
  super_senior: { start: "2008-01-01", end: "2010-12-31" },
  elders: { start: "1900-01-01", end: "2007-12-31" }
};

const ITEM_NAMES_MAP = {
  s_essay: "ഉപന്യാസം",
  s_story: "ചെറുകഥ",
  s_poetry: "കവിത",
  s_paint_water: "ചിത്ര രചന (ജലച്ചായം)",
  s_paint_pencil: "ചിത്ര രചന (പെൻസിൽ)",
  k_elocution: "പ്രസംഗം",
  k_music: "സംഗീതം",
  k_bible_reading: "ബൈബിൾ വായന",
  k_dance: "നാടോടി നൃത്തം",
  k_quiz: "മിഷൻ ക്വിസ്",
  k_kadhaprasangam: "കഥാപ്രസംഗം",
  k_parichamuttu: "പരിചമുട്ട്കളി (ഗ്രൂപ്പ്)",
  k_margamkali: "മാർഗ്ഗംകളി (ഗ്രൂപ്പ്)",
  k_bible_drisya: "ബൈബിൾ ദൃശ്യാവതരണം (ഗ്രൂപ്പ്)",
  k_mission_anthem: "മിഷൻ ആന്തം (ഗ്രൂപ്പ്)",
  k_group_song: "സമൂഹഗാനം (ഗ്രൂപ്പ്)"
};

const GROUP_ITEMS = {
  male: [
    { id: "k_parichamuttu", nameMal: "പരിചമുട്ട്കളി (ഗ്രൂപ്പ്)", nameEng: "Parichamuttukali (Group)", size: 8 }
  ],
  female: [
    { id: "k_margamkali", nameMal: "മാർഗ്ഗംകളി (ഗ്രൂപ്പ്)", nameEng: "Margamkali (Group)", size: 7 }
  ],
  common: [
    { id: "k_bible_drisya", nameMal: "ബൈബിൾ ദൃശ്യാവതരണം (ഗ്രൂപ്പ്)", nameEng: "Bible Presentation (Group)", size: 5 },
    { id: "k_mission_anthem", nameMal: "മിഷൻ ആന്തം (ഗ്രൂപ്പ്)", nameEng: "Mission Anthem (Group)", size: 7 },
    { id: "k_group_song", nameMal: "സമൂഹഗാനം (ഗ്രൂപ്പ്)", nameEng: "Group Song (Group)", size: 7 }
  ]
};

export default function App() {
  const [db, setDb] = useState(null);
  const [currentYear, setCurrentYear] = useState("2026");
  const [activeTab, setActiveTab] = useState("home");
  const [theme, setTheme] = useState("light");
  const [supabaseUrlInput, setSupabaseUrlInput] = useState(() => getSupabaseConfig().url);
  const [supabaseKeyInput, setSupabaseKeyInput] = useState(() => getSupabaseConfig().anonKey);
  const [cloudStatus, setCloudStatus] = useState(() => getSupabaseConfig().url && getSupabaseConfig().anonKey ? 'connected' : 'local');

  // Search & Filter States for Participants Modal
  const [partSearch, setPartSearch] = useState("");
  const [partParishFilter, setPartParishFilter] = useState("");
  const [partGenderFilter, setPartGenderFilter] = useState("");
  const [partCategoryFilter, setPartCategoryFilter] = useState("");
  const [partItemFilter, setPartItemFilter] = useState("");

  // Dedicated Modal Window States & Maximize Options for Participants & Chest Number Management
  const [showParticipantsModal, setShowParticipantsModal] = useState(false);
  const [isParticipantsMaximized, setIsParticipantsMaximized] = useState(false);

  const [showAllottedChestModal, setShowAllottedChestModal] = useState(false);
  const [isAllottedChestMaximized, setIsAllottedChestMaximized] = useState(false);
  const [allottedTab, setAllottedTab] = useState('individual'); // individual | group
  const [allottedSearch, setAllottedSearch] = useState('');
  const [allottedStatusFilter, setAllottedStatusFilter] = useState('all'); // all | allotted | pending
  const [allottedParishFilter, setAllottedParishFilter] = useState('');
  const [allottedCategoryFilter, setAllottedCategoryFilter] = useState('');
  const [editingChestKey, setEditingChestKey] = useState(null);
  const [editingChestValue, setEditingChestValue] = useState('');
  const [showChestManagementModal, setShowChestManagementModal] = useState(false);
  const [isChestMaximized, setIsChestMaximized] = useState(false);
  const [chestModalSubTab, setChestModalSubTab] = useState("auto"); // auto | clear

  // Dedicated Modal Window State for View & Print Group Items
  const [showGroupPrintModal, setShowGroupPrintModal] = useState(false);
  const [isGroupPrintMaximized, setIsGroupPrintMaximized] = useState(false);
  const [groupPrintItem, setGroupPrintItem] = useState("all");
  const [groupPrintParish, setGroupPrintParish] = useState("all");

  // Dedicated Modal Window State for View & Print Results
  const [showResultsModal, setShowResultsModal] = useState(false);
  const [isResultsMaximized, setIsResultsMaximized] = useState(false);

  // Dedicated Modal Window State for Edit / Filter Results Modal in Enter Winners Page
  const [showEditResultsModal, setShowEditResultsModal] = useState(false);
  const [isEditResultsMaximized, setIsEditResultsMaximized] = useState(false);
  const [editResSearch, setEditResSearch] = useState("");
  const [editResCatTypeFilter, setEditResCatTypeFilter] = useState("all"); // all | sahithya | kalaa
  const [editResItemFilter, setEditResItemFilter] = useState("");
  const [editResParishFilter, setEditResParishFilter] = useState("");
  const [editResAgeFilter, setEditResAgeFilter] = useState("");
  const [editResGenderFilter, setEditResGenderFilter] = useState("");
  const [editResSortBy, setEditResSortBy] = useState("position"); // position | item | parish | name

  // Dedicated Modal Window State for Master Participant IDs
  const [showMasterIdModal, setShowMasterIdModal] = useState(false);

  // Dedicated Modal Window State for Rupatha Competition (1st & 2nd Winners)
  const [showRupathaModal, setShowRupathaModal] = useState(false);
  const [isRupathaMaximized, setIsRupathaMaximized] = useState(false);
  const [rupathaParishFilter, setRupathaParishFilter] = useState("");
  const [rupathaCategoryFilter, setRupathaCategoryFilter] = useState("");
  const [rupathaItemFilter, setRupathaItemFilter] = useState("");
  const [rupathaGenderFilter, setRupathaGenderFilter] = useState("");
  const [rupathaTypeMode, setRupathaTypeMode] = useState("both"); // both | sahithya | kalaa
  const [incRegSlNoInRupathaPrint, setIncRegSlNoInRupathaPrint] = useState(false);
  const [incMemNoInRupathaPrint, setIncMemNoInRupathaPrint] = useState(false);
  const [incChestNoInRupathaPrint, setIncChestNoInRupathaPrint] = useState(true);
  const [isMasterIdMaximized, setIsMasterIdMaximized] = useState(false);

  // Dedicated Modal Window State for Merge Participants
  const [showMergeModal, setShowMergeModal] = useState(false);
  const [isMergeMaximized, setIsMergeMaximized] = useState(false);
  const [mergeSourceId, setMergeSourceId] = useState("");
  const [mergeTargetId, setMergeTargetId] = useState("");

  // Auto-Suggest States for Participant Name typing
  const [nameSuggestions, setNameSuggestions] = useState([]);
  const [showNameSuggestions, setShowNameSuggestions] = useState(false);
  const [selectedSuggestionIdx, setSelectedSuggestionIdx] = useState(0);

  // 5-Stage Cascading Result Filter States for Results View
  const [resTypeFilter, setResTypeFilter] = useState("all"); // all | sahithya | kalaa
  const [resItemFilter, setResItemFilter] = useState(""); // item ID
  const [resParishFilter, setResParishFilter] = useState(""); // parish name
  const [resCategoryFilter, setResCategoryFilter] = useState(""); // age category key
  const [resGenderFilter, setResGenderFilter] = useState(""); // male | female | ""

  // Master ID Menu Filter States in Settings Modal
  const [masterIdParishFilter, setMasterIdParishFilter] = useState("");
  const [masterIdCatFilter, setMasterIdCatFilter] = useState("");
  const [masterIdGenderFilter, setMasterIdGenderFilter] = useState("");
  const [masterIdSortBy, setMasterIdSortBy] = useState("masterId"); // masterId | name | parish

  // Participant Form State
  const [partForm, setPartForm] = useState({
    id: "",
    masterId: "",
    name: "",
    houseName: "",
    dob: "",
    membershipNo: "",
    registerSlNo: "",
    gender: "male",
    parish: PARISHES[0],
    chestNumber: "",
    registeredItems: [],
    registeredGroupItems: []
  });
  const [editingPartId, setEditingPartId] = useState(null);

  // Winner Entry State
  const [winnerEntryType, setWinnerEntryType] = useState("individual"); // individual | group
  const [winnerEntryMode, setWinnerEntryMode] = useState("chest"); // chest | select
  const [winnerChestSearch, setWinnerChestSearch] = useState("");
  const [winnerFoundPart, setWinnerFoundPart] = useState(null);

  // Group Winner Entry States
  const [winnerGroupEntryMode, setWinnerGroupEntryMode] = useState("chest"); // chest | select
  const [winnerGroupChestSearch, setWinnerGroupChestSearch] = useState("");
  const [winnerFoundGroup, setWinnerFoundGroup] = useState(null);

  // Winner Form State
  const [winnerForm, setWinnerForm] = useState({
    id: "",
    participantId: "",
    chestNumber: "",
    parish: "",
    itemType: "individual",
    category: "sahithya",
    ageCategory: "sub_junior",
    gender: "male",
    itemName: "s_essay",
    position: "1",
    grade: "A"
  });

  // Winner Select Mode (Mode 2) Dropdown states
  const [winSelItem, setWinSelItem] = useState("s_essay");
  const [winSelParish, setWinSelParish] = useState(PARISHES[0]);
  const [winSelAge, setWinSelAge] = useState("sub_junior");
  const [winSelGender, setWinSelGender] = useState("male");
  const [winSelPartId, setWinSelPartId] = useState("");

  // Edit Result Modal state
  const [editResultModal, setEditResultModal] = useState({ show: false, result: null });

  // New Year input state in System Settings
  const [newYearInputVal, setNewYearInputVal] = useState("");

  // External Database Merge Conflict Modal State
  const [mergeConflictModal, setMergeConflictModal] = useState({
    show: false,
    incomingDb: null,
    violations: [],
    validCount: 0,
    violatingCount: 0
  });

  // Participant Conflict Details Popup Modal State
  const [conflictDetailsModal, setConflictDetailsModal] = useState({
    show: false,
    participantName: "",
    parish: "",
    issues: []
  });

  // Print Option States for Register Sl. No. & Membership No. (Participants Roster)
  const [incRegSlNoInPrint, setIncRegSlNoInPrint] = useState(false);
  const [incMemNoInPrint, setIncMemNoInPrint] = useState(false);

  // Registered Participants Roster Print Panel Modes & Multi-Select Filters
  const [partFilterMode, setPartFilterMode] = useState('simple'); // 'simple' | 'multi'
  const [partModalCategoryMode, setPartModalCategoryMode] = useState('both'); // 'sahithya' | 'kalaa' | 'both'
  const [partSelectedParishes, setPartSelectedParishes] = useState([]);
  const [partSelectedCategories, setPartSelectedCategories] = useState([]);
  const [partSelectedGenders, setPartSelectedGenders] = useState([]);
  const [partSelectedItems, setPartSelectedItems] = useState([]);
  const [activePopover, setActivePopover] = useState(null); // 'parish' | 'category' | 'gender' | 'item' | null

  // Separate Independent Print Option States for Register Sl. No. & Membership No. (Results View)
  const [incRegSlNoInResultsPrint, setIncRegSlNoInResultsPrint] = useState(false);
  const [incMemNoInResultsPrint, setIncMemNoInResultsPrint] = useState(false);
  const [incChestNoInResultsPrint, setIncChestNoInResultsPrint] = useState(true);

  // View & Print Results Page Modes & Multi-Select Filters
  const [resFilterMode, setResFilterMode] = useState('simple'); // 'simple' | 'multi'
  const [resModalCategoryMode, setResModalCategoryMode] = useState('both'); // 'sahithya' | 'kalaa' | 'both'
  const [resSelectedParishes, setResSelectedParishes] = useState([]);
  const [resSelectedCategories, setResSelectedCategories] = useState([]);
  const [resSelectedGenders, setResSelectedGenders] = useState([]);
  const [resSelectedItems, setResSelectedItems] = useState([]);
  const [activeResPopover, setActiveResPopover] = useState(null); // 'parish' | 'category' | 'gender' | 'item' | null

  // Standalone Grade Calculator States
  const [calcMark, setCalcMark] = useState("");
  const [calcMaxMark, setCalcMaxMark] = useState("200"); // "200" (2 Judges) | "300" (3 Judges)
  const [calcResult, setCalcResult] = useState(null);

  // Clear Chest Numbers Modal State
  const [clearChestModal, setClearChestModal] = useState({
    mode: "all", // all | category_ind | group_gender | group_common | participant
    category: "sub_junior",
    gender: "all", // all | male | female
    itemId: "",
    participantId: ""
  });
  const [confirmClearModal, setConfirmClearModal] = useState(false);
  const [confirmResetDbModal, setConfirmResetDbModal] = useState(false);

  // Auto-Assign Chest Numbers Modal State with Individual & Group Categorized Tabs
  const [autoChestTab, setAutoChestTab] = useState("individual"); // individual | group
  const [autoChestModal, setAutoChestModal] = useState({ 
    category: "sahithya", // sahithya | kalaa
    ageCategory: "sub_junior", 
    gender: "male", // male | female
    groupType: "gender_based", // gender_based | common
    itemId: "", 
    startingNumber: "101" 
  });

  // Toast & Warning Modals
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });
  const [warningModal, setWarningModal] = useState({ show: false, message: "", items: [] });

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => {
      setToast({ show: false, message: '', type: 'success' });
    }, 3500);
  };

  // Load database on start & auto-assign Master IDs
  useEffect(() => {
    async function loadData() {
      try {
        let loadedDb = null;
        if (window.api) {
          loadedDb = await window.api.dbLoad();
        } else {
          try {
            const remoteDb = await loadDbFromSupabase();
            if (remoteDb && typeof remoteDb === 'object' && remoteDb.years) {
              loadedDb = remoteDb;
              localStorage.setItem('cml_db', JSON.stringify(remoteDb));
              setCloudStatus('connected');
            }
          } catch (supaErr) {
            console.error('Supabase load error, falling back to localStorage:', supaErr);
            setCloudStatus('error');
          }
          if (!loadedDb) {
            const localData = localStorage.getItem('cml_db');
          if (localData) {
            try {
              loadedDb = JSON.parse(localData);
            } catch (e) {
              console.error('Error parsing localStorage cml_db:', e);
            }
          }
          }
        }

        if (!loadedDb || typeof loadedDb !== 'object' || !loadedDb.years) {
          loadedDb = {
            settings: { currentYear: "2026" },
            years: {
              "2026": {
                activeCategory: "both",
                ageCategoryRules: JSON.parse(JSON.stringify(DEFAULT_DOB_RANGES)),
                participants: [],
                results: []
              }
            }
          };
        }

        if (loadedDb && loadedDb.years) {
          let updated = false;
          Object.keys(loadedDb.years).forEach(yrKey => {
            const yr = loadedDb.years[yrKey];
            if (yr.participants) {
              yr.participants.forEach((p, idx) => {
                if (!p.masterId) {
                  p.masterId = "PID-" + String(idx + 1001);
                  updated = true;
                }
              });
            }
          });
          if (updated) {
            if (window.api) await window.api.dbSave(loadedDb);
            else localStorage.setItem('cml_db', JSON.stringify(loadedDb));
          }
        }

        setDb(loadedDb);
        if (loadedDb?.settings?.currentYear) {
          setCurrentYear(loadedDb.settings.currentYear);
        }
      } catch (err) {
        showToast("ഡാറ്റാബേസ് ലോഡ് ചെയ്യുന്നതിൽ പിശക്: " + err.message, "error");
      }
    }
    loadData();
  }, []);

  // Sync theme
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);

  // Helper to save DB safely
  const saveDb = async (newDb) => {
    setDb(newDb);
    try {
      if (window.api) {
        await window.api.dbSave(newDb);
      } else {
        localStorage.setItem('cml_db', JSON.stringify(newDb));
        const cfg = getSupabaseConfig();
        if (cfg.url && cfg.anonKey) {
          await saveDbToSupabase(newDb);
          setCloudStatus('connected');
        }
      }
    } catch (err) {
      showToast("ഡാറ്റ സേവ് ചെയ്യുന്നതിൽ പിശക്: " + err.message, "error");
    }
  };

  const handleSyncFromCloud = async () => {
    try {
      const remote = await loadDbFromSupabase();
      if (remote && typeof remote === 'object' && remote.years) {
        setDb(remote);
        localStorage.setItem('cml_db', JSON.stringify(remote));
        if (remote.settings?.currentYear) setCurrentYear(remote.settings.currentYear);
        setCloudStatus('connected');
        showToast('ക്ലൗഡിൽ നിന്ന് പുതിയ ഡാറ്റ ലോഡ് ചെയ്തു!', 'success');
      } else {
        showToast('ക്ലൗഡിൽ ഡാറ്റയൊന്നും കണ്ടെത്തിയില്ല.', 'info');
      }
    } catch (err) {
      setCloudStatus('error');
      showToast('ക്ലൗഡ് സിങ്ക് പിശക്: ' + err.message, 'error');
    }
  };

  const handlePushToCloud = async () => {
    if (!db) return;
    try {
      await saveDbToSupabase(db);
      setCloudStatus('connected');
      showToast('ഈ ഉപകരണത്തിലെ ഡാറ്റ ക്ലൗഡിലേക്ക് അപ്‌ലോഡ് ചെയ്തു!', 'success');
    } catch (err) {
      setCloudStatus('error');
      showToast('ക്ലൗഡ് അപ്‌ലോഡ് പിശക്: ' + err.message, 'error');
    }
  };

  const yearData = useMemo(() => {
    if (!db) return { activeCategory: "both", ageCategoryRules: JSON.parse(JSON.stringify(DEFAULT_DOB_RANGES)), participants: [], results: [] };
    if (!db.years[currentYear]) {
      return {
        activeCategory: "both",
        ageCategoryRules: JSON.parse(JSON.stringify(DEFAULT_DOB_RANGES)),
        participants: [],
        results: []
      };
    }
    return db.years[currentYear];
  }, [db, currentYear]);

  useEffect(() => {
    if (db && !db.years[currentYear]) {
      const updatedDb = JSON.parse(JSON.stringify(db));
      updatedDb.years[currentYear] = {
        activeCategory: "both",
        ageCategoryRules: JSON.parse(JSON.stringify(DEFAULT_DOB_RANGES)),
        participants: [],
        results: []
      };
      saveDb(updatedDb);
    }
  }, [db, currentYear]);

  const activeCategory = yearData.activeCategory || "both";
  const ageCategoryRules = yearData.ageCategoryRules || JSON.parse(JSON.stringify(DEFAULT_DOB_RANGES));
  const participants = yearData.participants || [];
  const results = yearData.results || [];

  // Strictly calculate parishes that have AT LEAST 1 participant registered for the selected Group Item
  const registeredParishesForGroupItem = useMemo(() => {
    if (winnerEntryType !== 'group' || !winnerForm.itemName) return [];
    const parishSet = new Set();
    participants.forEach(p => {
      if (p.registeredGroupItems && p.registeredGroupItems.includes(winnerForm.itemName)) {
        if (p.parish) parishSet.add(p.parish);
      }
    });
    return Array.from(parishSet).sort((a, b) => a.localeCompare(b));
  }, [winnerEntryType, winnerForm.itemName, participants]);

  // Active Category mode switcher handler
  const handleSetCategoryMode = (mode) => {
    const updatedDb = JSON.parse(JSON.stringify(db));
    if (!updatedDb.years[currentYear]) updatedDb.years[currentYear] = {};
    updatedDb.years[currentYear].activeCategory = mode;
    saveDb(updatedDb);
    showToast("മത്സര തരം അപ്‌ഡേറ്റ് ചെയ്തു!", "success");
  };

  // Add new competition year
  const handleAddNewYear = (newYear) => {
    if (!newYear || isNaN(newYear)) {
      showToast("സാധുവായ ഒരു വർഷം നൽകുക!", "error");
      return;
    }
    const yrStr = String(newYear).trim();
    const updatedDb = JSON.parse(JSON.stringify(db));
    if (updatedDb.years[yrStr]) {
      showToast("ഈ വർഷം ഇതിനകം നിലവിലുണ്ട്!", "error");
      return;
    }

    updatedDb.years[yrStr] = {
      activeCategory: "both",
      ageCategoryRules: JSON.parse(JSON.stringify(DEFAULT_DOB_RANGES)),
      participants: [],
      results: []
    };
    updatedDb.settings.currentYear = yrStr;
    saveDb(updatedDb);
    setCurrentYear(yrStr);
    setNewYearInputVal("");
    showToast(`പുതിയ വർഷം (${yrStr}) നിർമ്മിച്ചിരിക്കുന്നു!`, "success");
  };

  const calculateAgeGroup = (dobString) => {
    if (!dobString) return null;
    const dob = new Date(dobString);
    if (isNaN(dob.getTime())) return null;

    for (const [group, range] of Object.entries(ageCategoryRules)) {
      const start = new Date(range.start);
      const end = new Date(range.end);
      if (dob >= start && dob <= end) {
        return group;
      }
    }
    return null;
  };

  const getItemDisplayName = (itemId) => ITEM_NAMES_MAP[itemId] || itemId;

  // Handler for Parish Dropdown change (Resets Name input and suggestion popup)
  const handleParishChange = (newParish) => {
    setPartForm(prev => ({
      ...prev,
      parish: newParish,
      name: "",
      houseName: "",
      dob: "",
      membershipNo: "",
      chestNumber: "",
      registeredItems: [],
      registeredGroupItems: []
    }));
    setEditingPartId(null);
    setNameSuggestions([]);
    setShowNameSuggestions(false);
  };

  // Title Case Helper — capitalises the first letter of every word
  const toTitleCase = (str) => str.replace(/\b\w/g, (char) => char.toUpperCase());

  // Strict Parish & Strict Spelling Auto-Suggest Handler
  const handleNameInputChange = (val) => {
    setPartForm(prev => ({ ...prev, name: val }));

    if (!val || val.trim().length < 1) {
      setNameSuggestions([]);
      setShowNameSuggestions(false);
      return;
    }

    const searchVal = val.toLowerCase().trim();

    // Strictly filter candidates belonging to the selected Parish and matching the typed spelling
    const matches = participants.filter(p => {
      if (editingPartId && p.id === editingPartId) return false;

      // 1. Strict Parish Match
      if (p.parish !== partForm.parish) return false;

      // 2. Strict Spelling Match (Name or House Name must contain typed spelling)
      const nameMatch = (p.name || '').toLowerCase().includes(searchVal);
      const houseMatch = (p.houseName || '').toLowerCase().includes(searchVal);

      return nameMatch || houseMatch;
    });

    // Sort matches alphabetically by name
    matches.sort((a, b) => a.name.localeCompare(b.name));

    setNameSuggestions(matches);
    setShowNameSuggestions(matches.length > 0);
    setSelectedSuggestionIdx(0);
  };

  // Keyboard navigation (Enter / Up / Down / Escape) for Auto-Suggest
  const handleNameKeyDown = (e) => {
    if (!showNameSuggestions || nameSuggestions.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedSuggestionIdx(prev => (prev + 1) % nameSuggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedSuggestionIdx(prev => (prev - 1 + nameSuggestions.length) % nameSuggestions.length);
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (nameSuggestions[selectedSuggestionIdx]) {
        selectParticipantSuggestion(nameSuggestions[selectedSuggestionIdx]);
      }
    } else if (e.key === 'Escape') {
      setShowNameSuggestions(false);
    }
  };

  // Select candidate from auto-suggest box
  const selectParticipantSuggestion = (p) => {
    setPartForm({
      id: p.id,
      masterId: p.masterId || "",
      name: p.name,
      houseName: p.houseName || "",
      dob: p.dob || "",
      membershipNo: p.membershipNo || "",
      registerSlNo: p.registerSlNo || "",
      gender: p.gender || "male",
      parish: p.parish || PARISHES[0],
      chestNumber: p.chestNumber || "",
      registeredItems: [...(p.registeredItems || [])],
      registeredGroupItems: [...(p.registeredGroupItems || [])]
    });
    setEditingPartId(p.id);
    setShowNameSuggestions(false);
    showToast(`നിലവിലുള്ള മത്സരാർത്ഥിയെ (${p.name} - ${p.parish}) ലോഡ് ചെയ്തു! പുതിയ ഇനങ്ങൾ തിരഞ്ഞെടുത്ത് സേവ് ചെയ്യുക.`, "info");
  };

  // Merge Participants Logic
  const handleExecuteMergeParticipants = () => {
    if (!mergeSourceId || !mergeTargetId) {
      showToast("ദയവായി ലയിപ്പിക്കേണ്ട രണ്ട് മത്സരാർത്ഥികളെയും തിരഞ്ഞെടുക്കുക!", "error");
      return;
    }
    if (mergeSourceId === mergeTargetId) {
      showToast("ലയിപ്പിക്കേണ്ട മത്സരാർത്ഥികൾ രണ്ടും ഒന്നാണ്! വ്യത്യസ്ത മത്സരാർത്ഥികളെ തിരഞ്ഞെടുക്കുക.", "error");
      return;
    }

    const sourcePart = participants.find(p => p.id === mergeSourceId);
    const targetPart = participants.find(p => p.id === mergeTargetId);

    if (!sourcePart || !targetPart) {
      showToast("മത്സരാർത്ഥികളുടെ വിവരങ്ങൾ കണ്ടെത്താനായില്ല!", "error");
      return;
    }

    if (!confirm(`ശ്രദ്ധിക്കുക: ${sourcePart.name} (${sourcePart.houseName}) എന്ന മത്സരാർത്ഥിയുടെ എല്ലാ ഇനങ്ങളും ഫലങ്ങളും ${targetPart.name} (${targetPart.houseName}) എന്ന പ്രൊഫൈലിലേക്ക് ലയിപ്പിക്കാൻ നിങ്ങൾക്ക് ഉറപ്പാണോ?`)) {
      return;
    }

    const updatedDb = JSON.parse(JSON.stringify(db));
    const yr = updatedDb.years[currentYear];

    const targetInDb = yr.participants.find(p => p.id === mergeTargetId);

    if (targetInDb) {
      // Merge registered individual items
      const mergedItems = Array.from(new Set([...(targetInDb.registeredItems || []), ...(sourcePart.registeredItems || [])]));
      // Merge registered group items
      const mergedGroupItems = Array.from(new Set([...(targetInDb.registeredGroupItems || []), ...(sourcePart.registeredGroupItems || [])]));

      targetInDb.registeredItems = mergedItems;
      targetInDb.registeredGroupItems = mergedGroupItems;

      if (!targetInDb.chestNumber && sourcePart.chestNumber) {
        targetInDb.chestNumber = sourcePart.chestNumber;
      }
    }

    // Transfer all winner results logged under source candidate to target candidate
    yr.results.forEach(res => {
      if (res.participantId === mergeSourceId) {
        res.participantId = mergeTargetId;
        res.parish = targetPart.parish;
        if (targetPart.chestNumber) res.chestNumber = targetPart.chestNumber;
      }
    });

    // Remove source candidate from DB
    yr.participants = yr.participants.filter(p => p.id !== mergeSourceId);

    saveDb(updatedDb);
    setShowMergeModal(false);
    setMergeSourceId("");
    setMergeTargetId("");
    showToast(`${sourcePart.name} ന്റെ വിവരങ്ങൾ ${targetPart.name} പ്രൊഫൈലിലേക്ക് ലയിപ്പിച്ചു!`, "success");
  };

  // Universal Global Chest Number Conflict Checker — Enforces complete uniqueness across all individual and group items
  const isChestNumberAlreadyUsed = (numToCheck, yrData, currentGroupItemId = null, currentParish = null, currentParticipantId = null) => {
    const strNum = String(numToCheck || '').trim();
    if (!strNum) return false;

    // 1. Check in all individual participants
    if (yrData?.participants) {
      for (const p of yrData.participants) {
        if (currentParticipantId && p.id === currentParticipantId) continue;
        if (p.chestNumber && String(p.chestNumber).trim() === strNum) {
          return true;
        }
      }
    }

    // 2. Check across ALL group items in groupChestNumbers
    if (yrData?.groupChestNumbers) {
      for (const itemId of Object.keys(yrData.groupChestNumbers)) {
        const parishMap = yrData.groupChestNumbers[itemId] || {};
        for (const [parish, chest] of Object.entries(parishMap)) {
          if (currentGroupItemId && currentParish && itemId === currentGroupItemId && parish === currentParish) {
            continue;
          }
          if (chest && String(chest).trim() === strNum) {
            return true;
          }
        }
      }
    }

    return false;
  };

  // Strict Eligibility helper
  const getAvailableItemsForParticipant = (gender, dob) => {
    const ageGroup = calculateAgeGroup(dob);
    if (!ageGroup) return { sahithya: [], kalaa: [] };

    const sahithyaList = [];
    const kalaaList = [];

    // --- Sahithya Items ---
    if (ageGroup !== 'sub_junior') {
      sahithyaList.push({ id: "s_essay", nameMal: "ഉപന്യാസം", nameEng: "Essay", type: 'individual', cat: 'sahithya' });
    }
    if (ageGroup !== 'sub_junior') {
      sahithyaList.push({ id: "s_story", nameMal: "ചെറുകഥ", nameEng: "Short Story", type: 'individual', cat: 'sahithya' });
    }
    if (ageGroup !== 'sub_junior') {
      sahithyaList.push({ id: "s_poetry", nameMal: "കവിത", nameEng: "Poetry", type: 'individual', cat: 'sahithya' });
    }
    if (ageGroup === 'sub_junior') {
      sahithyaList.push({ id: "s_paint_water", nameMal: "ചിത്ര രചന (ജലച്ചായം)", nameEng: "Water Color Painting", type: 'common', cat: 'sahithya' });
    }
    if (ageGroup !== 'sub_junior') {
      sahithyaList.push({ id: "s_paint_pencil", nameMal: "ചിത്ര രചന (പെൻസിൽ)", nameEng: "Pencil Drawing", type: 'common', cat: 'sahithya' });
    }

    // --- Kalaa Items ---
    kalaaList.push({ id: "k_elocution", nameMal: "പ്രസംഗം", nameEng: "Elocution", type: 'individual', cat: 'kalaa' });
    kalaaList.push({ id: "k_music", nameMal: "സംഗീതം", nameEng: "Music", type: 'individual', cat: 'kalaa' });
    if (ageGroup === 'sub_junior') {
      kalaaList.push({ id: "k_bible_reading", nameMal: "ബൈബിൾ വായന", nameEng: "Bible Reading", type: 'individual', cat: 'kalaa' });
    }
    if (gender === 'female' && (ageGroup === 'sub_junior' || ageGroup === 'junior')) {
      kalaaList.push({ id: "k_dance", nameMal: "നാടോടി നൃത്തം", nameEng: "Folk Dance", type: 'individual', cat: 'kalaa' });
    }
    if (ageGroup !== 'sub_junior') {
      kalaaList.push({ id: "k_quiz", nameMal: "മിഷൻ ക്വിസ്", nameEng: "Mission Quiz", type: 'individual', cat: 'kalaa' });
    }
    if (ageGroup === 'sub_junior' || ageGroup === 'junior' || ageGroup === 'senior') {
      kalaaList.push({ id: "k_kadhaprasangam", nameMal: "കഥാപ്രസംഗം", nameEng: "Kadhaprasangam", type: 'common', cat: 'kalaa' });
    }

    if (gender === 'male') {
      kalaaList.push({ id: "k_parichamuttu", nameMal: "പരിചമുട്ട്കളി (ഗ്രൂപ്പ്)", nameEng: "Parichamuttukali (Group)", size: 8, type: 'group', cat: 'kalaa' });
    } else if (gender === 'female') {
      kalaaList.push({ id: "k_margamkali", nameMal: "മാർഗ്ഗംകളി (ഗ്രൂപ്പ്)", nameEng: "Margamkali (Group)", size: 7, type: 'group', cat: 'kalaa' });
    }
    kalaaList.push({ id: "k_bible_drisya", nameMal: "ബൈബിൾ ദൃശ്യാവതരണം (ഗ്രൂപ്പ്)", nameEng: "Bible Presentation (Group)", size: 5, type: 'group', cat: 'kalaa' });
    kalaaList.push({ id: "k_mission_anthem", nameMal: "മിഷൻ ആന്തം (ഗ്രൂപ്പ്)", nameEng: "Mission Anthem (Group)", size: 7, type: 'group', cat: 'kalaa' });
    kalaaList.push({ id: "k_group_song", nameMal: "സമൂഹഗാനം (ഗ്രൂപ്പ്)", nameEng: "Group Song (Group)", size: 7, type: 'group', cat: 'kalaa' });

    return { sahithya: sahithyaList, kalaa: kalaaList };
  };

  // Clear Chest Numbers Dynamic Items Builder
  const itemsForClearChestDropdown = useMemo(() => {
    const list = [];
    if (clearChestModal.mode === 'category_ind') {
      Object.entries(ITEM_NAMES_MAP).forEach(([id, name]) => {
        const isGrp = id === 'k_parichamuttu' || id === 'k_margamkali' || id === 'k_bible_drisya' || id === 'k_mission_anthem' || id === 'k_group_song';
        if (!isGrp) list.push({ id, name });
      });
    } else if (clearChestModal.mode === 'group_gender') {
      if (clearChestModal.gender === 'female') {
        list.push({ id: 'k_margamkali', name: ITEM_NAMES_MAP['k_margamkali'] });
      } else if (clearChestModal.gender === 'male') {
        list.push({ id: 'k_parichamuttu', name: ITEM_NAMES_MAP['k_parichamuttu'] });
      } else {
        list.push({ id: 'k_parichamuttu', name: ITEM_NAMES_MAP['k_parichamuttu'] });
        list.push({ id: 'k_margamkali', name: ITEM_NAMES_MAP['k_margamkali'] });
      }
    } else if (clearChestModal.mode === 'group_common') {
      list.push({ id: 'k_bible_drisya', name: ITEM_NAMES_MAP['k_bible_drisya'] });
      list.push({ id: 'k_mission_anthem', name: ITEM_NAMES_MAP['k_mission_anthem'] });
      list.push({ id: 'k_group_song', name: ITEM_NAMES_MAP['k_group_song'] });
    }
    return list;
  }, [clearChestModal]);

  // Auto-Assign Chest Numbers Dynamic Items Builder per Tab
  const itemsForAutoAssignDropdown = useMemo(() => {
    const list = [];
    if (autoChestTab === 'individual') {
      Object.entries(ITEM_NAMES_MAP).forEach(([id, name]) => {
        const isSah = id.startsWith('s_');
        const isKal = id.startsWith('k_');
        const isGrp = id === 'k_parichamuttu' || id === 'k_margamkali' || id === 'k_bible_drisya' || id === 'k_mission_anthem' || id === 'k_group_song';

        if (!isGrp) {
          if (autoChestModal.category === 'sahithya' && isSah) {
            list.push({ id, name });
          } else if (autoChestModal.category === 'kalaa' && isKal) {
            list.push({ id, name });
          }
        }
      });
    } else if (autoChestTab === 'group') {
      if (autoChestModal.groupType === 'gender_based') {
        if (autoChestModal.gender === 'male') {
          list.push({ id: 'k_parichamuttu', name: ITEM_NAMES_MAP['k_parichamuttu'] });
        } else {
          list.push({ id: 'k_margamkali', name: ITEM_NAMES_MAP['k_margamkali'] });
        }
      } else {
        list.push({ id: 'k_bible_drisya', name: ITEM_NAMES_MAP['k_bible_drisya'] });
        list.push({ id: 'k_mission_anthem', name: ITEM_NAMES_MAP['k_mission_anthem'] });
        list.push({ id: 'k_group_song', name: ITEM_NAMES_MAP['k_group_song'] });
      }
    }
    return list;
  }, [autoChestTab, autoChestModal]);

  // Dynamic Live Filtered Participants for Chest Number Management Modal Table
  const liveChestManagementParticipants = useMemo(() => {
    return participants.filter(p => {
      if (chestModalSubTab === 'auto') {
        if (autoChestTab === 'individual') {
          const matchCat = calculateAgeGroup(p.dob) === autoChestModal.ageCategory;
          const matchGen = p.gender === autoChestModal.gender;
          const matchesItem = !autoChestModal.itemId || p.registeredItems.includes(autoChestModal.itemId);
          return matchCat && matchGen && matchesItem;
        } else {
          const matchesGroupItem = !autoChestModal.itemId || (p.registeredGroupItems || []).includes(autoChestModal.itemId);
          if (autoChestModal.groupType === 'gender_based') {
            return p.gender === autoChestModal.gender && matchesGroupItem;
          }
          return matchesGroupItem;
        }
      } else {
        if (clearChestModal.mode === 'all') {
          return true;
        } else if (clearChestModal.mode === 'category_ind') {
          const matchCat = calculateAgeGroup(p.dob) === clearChestModal.category;
          const matchGen = clearChestModal.gender === 'all' || p.gender === clearChestModal.gender;
          const matchItem = !clearChestModal.itemId || p.registeredItems.includes(clearChestModal.itemId);
          return matchCat && matchGen && matchItem;
        } else if (clearChestModal.mode === 'group_gender') {
          const matchGen = clearChestModal.gender === 'all' || p.gender === clearChestModal.gender;
          const matchItem = !clearChestModal.itemId || (p.registeredGroupItems || []).includes(clearChestModal.itemId);
          return matchGen && matchItem;
        } else if (clearChestModal.mode === 'group_common') {
          return !clearChestModal.itemId || (p.registeredGroupItems || []).includes(clearChestModal.itemId);
        } else if (clearChestModal.mode === 'participant') {
          return !clearChestModal.participantId || p.id === clearChestModal.participantId;
        }
        return true;
      }
    });
  }, [participants, chestModalSubTab, autoChestTab, autoChestModal, clearChestModal]);

  // Group Parishes Data Helper for Chest Number Management Modal
  const groupParishesChestData = useMemo(() => {
    if (!autoChestModal.itemId) return [];
    const parishMap = {};
    participants.forEach(p => {
      if ((p.registeredGroupItems || []).includes(autoChestModal.itemId)) {
        if (!parishMap[p.parish]) {
          parishMap[p.parish] = [];
        }
        parishMap[p.parish].push(p);
      }
    });
    const currentGroupChestNumbers = db?.years?.[currentYear]?.groupChestNumbers || {};
    const itemChestNumbers = currentGroupChestNumbers[autoChestModal.itemId] || {};

    return Object.entries(parishMap).map(([parish, members]) => ({
      parish,
      members,
      chestNumber: itemChestNumbers[parish] || ""
    })).sort((a, b) => a.parish.localeCompare(b.parish));
  }, [participants, autoChestModal.itemId, db, currentYear]);

  // Group Parishes Data Helper for Clear Chest Numbers Tab
  const clearGroupParishesChestData = useMemo(() => {
    if (chestModalSubTab !== 'clear') return [];
    if (clearChestModal.mode !== 'group_gender' && clearChestModal.mode !== 'group_common') return [];

    let targetItemIds = [];
    if (clearChestModal.mode === 'group_gender') {
      if (clearChestModal.itemId) {
        targetItemIds = [clearChestModal.itemId];
      } else {
        targetItemIds = clearChestModal.gender === 'male' ? ['k_parichamuttu'] : clearChestModal.gender === 'female' ? ['k_margamkali'] : ['k_parichamuttu', 'k_margamkali'];
      }
    } else if (clearChestModal.mode === 'group_common') {
      if (clearChestModal.itemId) {
        targetItemIds = [clearChestModal.itemId];
      } else {
        targetItemIds = ['k_bible_drisya', 'k_mission_anthem', 'k_group_song'];
      }
    }

    const currentGroupChestNumbers = db?.years?.[currentYear]?.groupChestNumbers || {};
    const list = [];

    targetItemIds.forEach(itemId => {
      const parishMap = {};
      participants.forEach(p => {
        if ((p.registeredGroupItems || []).includes(itemId)) {
          if (!parishMap[p.parish]) {
            parishMap[p.parish] = [];
          }
          parishMap[p.parish].push(p);
        }
      });

      const itemChestNumbers = currentGroupChestNumbers[itemId] || {};
      Object.entries(parishMap).forEach(([parish, members]) => {
        list.push({
          itemId,
          itemName: getItemDisplayName(itemId),
          parish,
          members,
          chestNumber: itemChestNumbers[parish] || ""
        });
      });
    });

    return list.sort((a, b) => {
      const itemCmp = a.itemName.localeCompare(b.itemName);
      if (itemCmp !== 0) return itemCmp;
      return a.parish.localeCompare(b.parish);
    });
  }, [participants, chestModalSubTab, clearChestModal, db, currentYear]);

  // Group Print Data Helper
  const groupPrintData = useMemo(() => {
    const allGroupItemIds = ['k_parichamuttu', 'k_margamkali', 'k_bible_drisya', 'k_mission_anthem', 'k_group_song'];
    const targetItemIds = groupPrintItem === 'all' ? allGroupItemIds : [groupPrintItem];

    const result = [];
    const currentGroupChestNumbers = db?.years?.[currentYear]?.groupChestNumbers || {};

    targetItemIds.forEach(itemId => {
      const parishMap = {};
      participants.forEach(p => {
        if ((p.registeredGroupItems || []).includes(itemId)) {
          if (groupPrintParish === 'all' || p.parish === groupPrintParish) {
            if (!parishMap[p.parish]) {
              parishMap[p.parish] = [];
            }
            parishMap[p.parish].push(p);
          }
        }
      });

      const itemChestNumbers = currentGroupChestNumbers[itemId] || {};
      const parishList = Object.entries(parishMap).map(([parish, members]) => ({
        parish,
        members,
        chestNumber: itemChestNumbers[parish] || ""
      })).sort((a, b) => {
        const na = parseInt(a.chestNumber) || 0;
        const nb = parseInt(b.chestNumber) || 0;
        if (na && nb) return na - nb;
        return a.parish.localeCompare(b.parish);
      });

      if (parishList.length > 0) {
        result.push({
          itemId,
          itemName: ITEM_NAMES_MAP[itemId] || itemId,
          parishes: parishList
        });
      }
    });

    return result;
  }, [participants, groupPrintItem, groupPrintParish, db, currentYear]);

  // Items for Filter 2 (Select Item) strictly cascaded based on resModalCategoryMode
  const itemsForCascadedResultsDropdown = useMemo(() => {
    return Object.entries(ITEM_NAMES_MAP)
      .filter(([id]) => {
        if (resModalCategoryMode === 'sahithya') return id.startsWith('s_');
        if (resModalCategoryMode === 'kalaa') return id.startsWith('k_');
        return true;
      })
      .map(([id, name]) => ({ id, name }));
  }, [resModalCategoryMode]);

  // Items for Filter Modal in Enter Winners
  const itemsForEditResultsModalDropdown = useMemo(() => {
    return Object.entries(ITEM_NAMES_MAP)
      .filter(([id]) => {
        if (editResCatTypeFilter === 'sahithya') return id.startsWith('s_');
        if (editResCatTypeFilter === 'kalaa') return id.startsWith('k_');
        return true;
      })
      .map(([id, name]) => ({ id, name }));
  }, [editResCatTypeFilter]);

  // Reset Item filter if current item does not belong to newly selected Category Type
  const handleCategoryTypeChange = (newCatType) => {
    setResTypeFilter(newCatType);
    if (resItemFilter) {
      if (newCatType === 'sahithya' && !resItemFilter.startsWith('s_')) {
        setResItemFilter('');
      } else if (newCatType === 'kalaa' && !resItemFilter.startsWith('k_')) {
        setResItemFilter('');
      }
    }
  };

  // Standings Calculation
  const standings = useMemo(() => {
    const pointsMap = {};
    PARISHES.forEach(p => {
      pointsMap[p] = { parish: p, total: 0, sahithya: 0, kalaa: 0 };
    });

    const activeResults = db?.years?.[currentYear]?.results || [];

    activeResults.forEach(res => {
      let pts = 0;
      const isGroup = res.itemType === 'group';
      const pos = parseInt(res.position);

      if (!isGroup) {
        if (pos === 1) pts += 5;
        else if (pos === 2) pts += 3;
        else if (pos === 3) pts += 1;

        if (res.grade === 'A') pts += 5;
        else if (res.grade === 'B') pts += 3;
        else if (res.grade === 'C') pts += 1;

        if (pointsMap[res.parish]) {
          pointsMap[res.parish].total += pts;
          if (res.category === 'sahithya') pointsMap[res.parish].sahithya += pts;
          else pointsMap[res.parish].kalaa += pts;
        }
      } else {
        if (pos === 1) pts += 10;
        else if (pos === 2) pts += 5;
        else if (pos === 3) pts += 3;

        if (res.grade === 'A') pts += 5;
        else if (res.grade === 'B') pts += 3;
        else if (res.grade === 'C') pts += 1;

        if (pointsMap[res.parish]) {
          pointsMap[res.parish].total += pts;
          pointsMap[res.parish].kalaa += pts;
        }
      }
    });

    const allParishes = Object.values(pointsMap);
    const rankedParishes = allParishes.filter(p => p.total > 0).sort((a, b) => b.total - a.total);
    const unrankedParishes = allParishes.filter(p => p.total === 0).sort((a, b) => a.parish.localeCompare(b.parish));

    let currentRank = 1;
    const rankedWithPosition = rankedParishes.map((st, idx) => {
      if (idx > 0 && st.total < rankedParishes[idx - 1].total) {
        currentRank += 1;
      }
      return { ...st, rank: currentRank };
    });

    const unrankedWithPosition = unrankedParishes.map(st => ({
      ...st,
      rank: "-"
    }));

    return [...rankedWithPosition, ...unrankedWithPosition];
  }, [db, currentYear]);

  // Helper to format clean, uniform, filesystem-safe filenames for PDF export and <title> tags
  const buildExportFilename = (docType, params = {}) => {
    const parts = [docType, currentYear];

    const sanitizePart = (str) => {
      if (!str) return '';
      return String(str)
        .replace(/[\\/:*?"<>|]/g, '') // remove Windows forbidden characters
        .trim()
        .replace(/\s+/g, '_');
    };

    const mapCategory = (catKey) => {
      if (!catKey || catKey === 'all') return '';
      const map = {
        sub_junior: 'Sub_Junior',
        junior: 'Junior',
        senior: 'Senior',
        super_senior: 'Super_Senior',
        elders: 'Elder'
      };
      return map[catKey] || AGE_GROUPS_SHORT_ENG[catKey] || catKey;
    };

    const mapGender = (g) => {
      if (!g || g === 'all') return '';
      if (g === 'male') return 'Boys';
      if (g === 'female') return 'Girls';
      if (g === 'common') return 'Common';
      return sanitizePart(g);
    };

    if (params.mode && params.mode !== 'all' && params.mode !== 'both') {
      parts.push(sanitizePart(params.mode === 'sahithya' ? 'Sahithya' : params.mode === 'kalaa' ? 'Kalaa' : params.mode));
    }

    if (params.parish && params.parish !== 'all') {
      parts.push(sanitizePart(params.parish));
    }

    if (params.category && params.category !== 'all') {
      const catStr = mapCategory(params.category);
      if (catStr) parts.push(sanitizePart(catStr));
    }

    if (params.gender && params.gender !== 'all') {
      const gStr = mapGender(params.gender);
      if (gStr) parts.push(sanitizePart(gStr));
    }

    if (params.item && params.item !== 'all') {
      const cleanItem = getItemDisplayName(params.item) || ITEM_NAMES_MAP[params.item] || params.item;
      parts.push(sanitizePart(cleanItem));
    }

    if (params.extra) {
      parts.push(sanitizePart(params.extra));
    }

    const baseName = parts.filter(Boolean).join('_');
    return `${baseName}.pdf`;
  };

  // Centralized Helper for Reliable Printing and Native PDF Export
  const executePrintOrPdf = async (htmlContent, defaultFilename, isLandscape, action = 'print') => {
    try {
      if (action === 'pdf') {
        if (window.api && window.api.savePdf) {
          const res = await window.api.savePdf({ htmlContent, defaultFilename, landscape: isLandscape });
          if (res && res.success) {
            showToast('PDF ഫയൽ സേവ് ചെയ്തു!', 'success');
          } else if (res && res.error && res.error !== 'Cancelled') {
            showToast('PDF സേവ് ചെയ്യുമ്പോൾ പിശകുണ്ടായി: ' + res.error, 'error');
          }
          return;
        } else {
          showToast('ഡയറക്ട് PDF എക്സ്പോർട്ട് ലഭ്യമല്ല. പ്രിന്റ് വിൻഡോ ഉപയോഗിക്കുക.', 'info');
        }
      }

      const width = isLandscape ? 1100 : 900;
      const height = 750;
      const printWindow = window.open('', '_blank', `width=${width},height=${height}`);
      if (!printWindow) {
        showToast('പോപ്പ്-അപ്പ് വിൻഡോ ഓപ്പൺ ചെയ്യാൻ കഴിഞ്ഞില്ല.', 'error');
        return;
      }

      printWindow.document.open();
      printWindow.document.write(htmlContent);
      printWindow.document.close();

      const triggerPrint = () => {
        try {
          printWindow.focus();
          printWindow.print();
        } catch (err) {
          console.error('Print trigger error:', err);
        }
      };

      if (printWindow.document.fonts && printWindow.document.fonts.ready) {
        printWindow.document.fonts.ready.then(() => {
          setTimeout(triggerPrint, 250);
        }).catch(() => {
          setTimeout(triggerPrint, 350);
        });
      } else {
        setTimeout(triggerPrint, 350);
      }
    } catch (err) {
      console.error('executePrintOrPdf error:', err);
      showToast('പ്രിന്റ് ചെയ്യുമ്പോൾ പിശകുണ്ടായി: ' + (err.message || err), 'error');
    }
  };

  // Dedicated Standalone Generator & Printer for Registered Participants Roster
  const handlePrintParticipantsRoster = (action = 'print') => {
    const isLandscape = Boolean(incRegSlNoInPrint || incMemNoInPrint);
    const parishLabel = partFilterMode === 'simple'
      ? (partParishFilter || 'എല്ലാ ഇടവകകളും (All)')
      : (partSelectedParishes.length === 0 ? 'എല്ലാ ഇടവകകളും (All)' : partSelectedParishes.join(', '));

    const categoryLabel = partFilterMode === 'simple'
      ? (partCategoryFilter ? (AGE_GROUPS[partCategoryFilter] || partCategoryFilter) : 'എല്ലാ വിഭാഗങ്ങളും (All)')
      : (partSelectedCategories.length === 0 ? 'എല്ലാ വിഭാഗങ്ങളും (All)' : partSelectedCategories.map(k => AGE_GROUPS[k] || k).join(', '));

    const itemLabel = partFilterMode === 'simple'
      ? (partItemFilter ? getItemDisplayName(partItemFilter) : 'എല്ലാ ഇനങ്ങളും (All)')
      : (partSelectedItems.length === 0 ? 'എല്ലാ ഇനങ്ങളും (All)' : partSelectedItems.map(id => getItemDisplayName(id)).join(', '));

    const genderLabel = partFilterMode === 'simple'
      ? (partGenderFilter === 'male' ? 'ആൺകുട്ടി (Male)' : partGenderFilter === 'female' ? 'പെൺകുട്ടി (Female)' : 'എല്ലാ ജെൻഡറുകളും (All)')
      : (partSelectedGenders.length === 0 ? 'എല്ലാ ജെൻഡറുകളും (All)' : partSelectedGenders.map(g => g === 'male' ? 'Male' : 'Female').join(', '));

    const catModeLabel = partModalCategoryMode === 'sahithya' ? 'സാഹിത്യം മാത്രം (Sahithya Only)' : partModalCategoryMode === 'kalaa' ? 'കല മാത്രം (Kalaa Only)' : 'രണ്ടും (Both Sahithya & Kalaa)';

    const dynamicFilename = buildExportFilename('Participants', {
      mode: partModalCategoryMode,
      parish: partFilterMode === 'simple' ? partParishFilter : (partSelectedParishes.length === 1 ? partSelectedParishes[0] : (partSelectedParishes.length > 1 ? `${partSelectedParishes.length}_Parishes` : 'All_Parishes')),
      category: partFilterMode === 'simple' ? partCategoryFilter : (partSelectedCategories.length === 1 ? partSelectedCategories[0] : (partSelectedCategories.length > 1 ? `${partSelectedCategories.length}_Categories` : 'All_Categories')),
      gender: partFilterMode === 'simple' ? partGenderFilter : (partSelectedGenders.length === 1 ? partSelectedGenders[0] : ''),
      item: partFilterMode === 'simple' ? partItemFilter : (partSelectedItems.length === 1 ? partSelectedItems[0] : '')
    });

    const pageTitle = dynamicFilename.replace(/\.pdf$/i, '');

    const sorted = [...filteredParticipants].sort((a, b) => {
      const na = parseInt(a.chestNumber) || 999999;
      const nb = parseInt(b.chestNumber) || 999999;
      if (na !== nb) return na - nb;
      return (a.name || '').localeCompare(b.name || '');
    });

    const totalCols = 7 + (incRegSlNoInPrint ? 1 : 0) + (incMemNoInPrint ? 1 : 0);

    const rows = sorted.map((p, idx) => {
      const ageCategoryStr = AGE_GROUPS_SHORT_ENG[calculateAgeGroup(p.dob)] || '-';
      const genderStr = p.gender === 'male' ? 'M' : 'F';
      const { indItems, grpItems } = getDisplayItemsForParticipant(p);
      const itemsFormatted = [
        ...indItems.map(id => `• ${getItemDisplayName(id)}`),
        ...grpItems.map(id => `<strong style="color:#1e3a8a;">• ${getItemDisplayName(id)} (G)</strong>`)
      ].join('<br/>');

      const regSlNoCell = incRegSlNoInPrint ? `<td style="text-align:center;border:1px solid #334155;font-weight:700;">${p.registerSlNo || '-'}</td>` : '';
      const memNoCell = incMemNoInPrint ? `<td style="text-align:center;border:1px solid #334155;font-weight:700;">${p.membershipNo || '-'}</td>` : '';

      return `
        <tr>
          <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
          ${regSlNoCell}
          ${memNoCell}
          <td style="text-align:center;font-size:1.05rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${p.chestNumber || '-'}</td>
          <td style="border:1px solid #334155;">
            <div style="font-weight:bold;">${p.name}</div>
            <div style="font-size:0.85em;color:#555;">${p.houseName || ''}</div>
          </td>
          <td style="border:1px solid #334155;">${p.parish || ''}</td>
          <td style="text-align:center;border:1px solid #334155;">${ageCategoryStr}</td>
          <td style="text-align:center;border:1px solid #334155;">${genderStr}</td>
          <td style="border:1px solid #334155;font-size:0.85rem;line-height:1.35;">${itemsFormatted || '-'}</td>
        </tr>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { 
      size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'}; 
      margin: 8mm 10mm 8mm 10mm; 
    }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Kartika', 'Arial', sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { 
      width: 100%; 
      border-collapse: collapse; 
      page-break-inside: auto; 
      table-layout: fixed; 
      word-wrap: break-word; 
    }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: left; background: transparent !important; color: #0f172a !important; }
    .title-banner { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    .title-banner h1 { font-size: ${isLandscape ? '16pt' : '15pt'}; margin: 0 0 3px 0; color: #1e3a8a; font-weight: 800; }
    .title-banner .sub-title { font-size: 10pt; font-weight: 600; color: #334155; margin: 0; }
    .title-banner .sheet-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 2px 10px; border-radius: 4px; font-size: 9pt; font-weight: 700; margin-left: 6px; }
    .meta-card { display: grid; grid-template-columns: ${isLandscape ? '1.2fr 0.8fr' : '1.1fr 0.9fr'}; gap: 10px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px; }
    .meta-box-left { border-right: 1.5px solid #e2e8f0; padding-right: 10px; display: flex; flex-direction: column; gap: 4px; }
    .meta-box-right { padding-left: 4px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; }
    .meta-label { font-size: 7.5pt; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
    .meta-value { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
    .meta-sub-row { display: flex; gap: 14px; }
    .total-badge-box { display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 6px; padding: 4px 8px; }
    .total-badge-label { font-size: 8pt; font-weight: 700; color: #1e40af; }
    .total-badge-number { font-size: 10.5pt; font-weight: 800; color: #1e3a8a; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #93c5fd; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: ${isLandscape ? '8.8pt' : '8.2pt'} !important; font-weight: 700 !important; padding: 7px 5px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: ${isLandscape ? '7px 6px' : '6px 4px'} !important; font-size: ${isLandscape ? '9pt' : '8.5pt'} !important; color: #0f172a; box-sizing: border-box; vertical-align: top; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
    .page-footer-note { margin-top: 8px; font-size: 8pt; color: #64748b; text-align: right; font-weight: 600; page-break-inside: avoid; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <table class="print-table">
    <colgroup>
      <col style="width: ${isLandscape ? '38px' : '32px'};" />
      ${incRegSlNoInPrint ? `<col style="width: ${isLandscape ? '75px' : '65px'};" />` : ''}
      ${incMemNoInPrint ? `<col style="width: ${isLandscape ? '75px' : '65px'};" />` : ''}
      <col style="width: ${isLandscape ? '75px' : '65px'};" />
      <col style="width: auto;" />
      <col style="width: ${isLandscape ? '140px' : '105px'};" />
      <col style="width: ${isLandscape ? '80px' : '62px'};" />
      <col style="width: ${isLandscape ? '45px' : '38px'};" />
      <col style="width: ${isLandscape ? '220px' : '150px'};" />
    </colgroup>
    <thead>
      <tr>
        <th colspan="${totalCols}" class="header-container">
          <div class="title-banner">
            <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
            <p class="sub-title">
              കലാ സാഹിത്യ മത്സരങ്ങൾ &bull; <span class="sheet-badge">REGISTERED PARTICIPANTS ROSTER (മത്സരാർത്ഥികളുടെ പട്ടിക)</span>
            </p>
          </div>
          <div class="meta-card">
            <div class="meta-box-left">
              <div>
                <div class="meta-label">മത്സര തരം & ഇനം (Competition Mode & Item)</div>
                <div class="meta-value" style="color:#1e3a8a;">${catModeLabel} &bull; ${itemLabel}</div>
              </div>
              <div class="meta-sub-row">
                <div>
                  <div class="meta-label">വിഭാഗം (Category)</div>
                  <div class="meta-value">${categoryLabel}</div>
                </div>
                <div>
                  <div class="meta-label">ജെൻഡർ (Gender)</div>
                  <div class="meta-value">${genderLabel}</div>
                </div>
              </div>
            </div>
            <div class="meta-box-right">
              <div>
                <div class="meta-label">ഇടവക / യൂണിറ്റ് (Parish)</div>
                <div class="meta-value">${parishLabel}</div>
              </div>
              <div class="total-badge-box">
                <span class="total-badge-label">ആകെ മത്സരാർത്ഥികൾ:</span>
                <span class="total-badge-number">${sorted.length} പേർ</span>
              </div>
            </div>
          </div>
        </th>
      </tr>
      <tr class="col-header">
        <th>ക്രമ നം.</th>
        ${incRegSlNoInPrint ? '<th>അംഗത്വ ലിസ്റ്റ് നം.</th>' : ''}
        ${incMemNoInPrint ? '<th>അംഗത്വ നം.</th>' : ''}
        <th>ചെസ്റ്റ് നം.</th>
        <th style="text-align:left;">പേര് & വീട്ടുപേര് (Name & House Name)</th>
        <th style="text-align:left;">ഇടവക (Parish)</th>
        <th>വിഭാഗം</th>
        <th>ലിംഗം</th>
        <th style="text-align:left;">രജിസ്റ്റർ ചെയ്ത മത്സര ഇനങ്ങൾ</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="${totalCols}" style="text-align:center;padding:12px;">മത്സരാർത്ഥികളെയൊന്നും കണ്ടെത്തിയില്ല.</td></tr>`}</tbody>
  </table>
  <div class="page-footer-note">
    ചെറുപുഷ്പ മിഷൻ ലീഗ് &bull; ആകെ മത്സരാർത്ഥികൾ: ${sorted.length} പേർ
  </div>
</body>
</html>`;

    executePrintOrPdf(htmlContent, dynamicFilename, isLandscape, action);
  };

  // Master Filtered List for Rupatha Competition (Strictly 1st and 2nd Position Holders)
  const rupathaResultsList = useMemo(() => {
    let list = (results || []).filter(r => r.position === '1' || r.position === '2');

    if (rupathaTypeMode === 'sahithya') {
      list = list.filter(r => (r.itemName || '').startsWith('s_'));
    } else if (rupathaTypeMode === 'kalaa') {
      list = list.filter(r => (r.itemName || '').startsWith('k_'));
    }

    if (rupathaParishFilter) {
      list = list.filter(r => r.parish === rupathaParishFilter);
    }

    if (rupathaCategoryFilter) {
      list = list.filter(r => {
        const p = participants.find(part => part.id === r.participantId);
        const rAgeCat = r.ageCategory || (p && p.dob ? calculateAgeGroup(p.dob) : null);
        return rAgeCat === rupathaCategoryFilter;
      });
    }

    if (rupathaItemFilter) {
      list = list.filter(r => r.itemName === rupathaItemFilter);
    }

    if (rupathaGenderFilter) {
      list = list.filter(r => {
        const p = participants.find(part => part.id === r.participantId);
        const rGender = r.gender || (p ? p.gender : null);
        return rGender === rupathaGenderFilter;
      });
    }

    const itemOrder = Object.keys(ITEM_NAMES_MAP);
    const ageOrder = Object.keys(AGE_GROUPS);
    const genderOrder = { male: 0, female: 1 };
    const getAgeKey = (r) => {
      const p = participants.find(part => part.id === r.participantId);
      return r.ageCategory || (p && p.dob ? calculateAgeGroup(p.dob) : null);
    };
    const getGenderKey = (r) => {
      const p = participants.find(part => part.id === r.participantId);
      return r.gender || (p ? p.gender : null);
    };
    const idx = (arr, v) => { const i = arr.indexOf(v); return i === -1 ? 999 : i; };

    return list.sort((a, b) => {
      const typeA = (a.itemName || '').startsWith('s_') ? 0 : 1;
      const typeB = (b.itemName || '').startsWith('s_') ? 0 : 1;
      if (typeA !== typeB) return typeA - typeB;
      const itA = idx(itemOrder, a.itemName), itB = idx(itemOrder, b.itemName);
      if (itA !== itB) return itA - itB;
      const agA = idx(ageOrder, getAgeKey(a)), agB = idx(ageOrder, getAgeKey(b));
      if (agA !== agB) return agA - agB;
      const gA = genderOrder[getGenderKey(a)] ?? 2, gB = genderOrder[getGenderKey(b)] ?? 2;
      if (gA !== gB) return gA - gB;
      if (a.position !== b.position) return (a.position || '9').localeCompare(b.position || '9');
      return (a.parish || '').localeCompare(b.parish || '');
    });
  }, [results, participants, rupathaTypeMode, rupathaParishFilter, rupathaCategoryFilter, rupathaItemFilter, rupathaGenderFilter]);

  const handlePrintRupathaResults = (action = 'print') => {
    const isLandscape = Boolean(incRegSlNoInRupathaPrint || incMemNoInRupathaPrint);
    const sorted = [...rupathaResultsList];

    const parishLabel = rupathaParishFilter || 'എല്ലാ ഇടവകകളും (All Parishes)';
    const categoryLabel = rupathaCategoryFilter ? (AGE_GROUPS[rupathaCategoryFilter] || rupathaCategoryFilter) : 'എല്ലാ വിഭാഗങ്ങളും (All Categories)';
    const itemLabel = rupathaItemFilter ? getItemDisplayName(rupathaItemFilter) : 'എല്ലാ ഇനങ്ങളും (All Items)';
    const genderLabel = rupathaGenderFilter === 'male' ? 'Male' : (rupathaGenderFilter === 'female' ? 'Female' : 'All Genders');
    const catModeLabel = rupathaTypeMode === 'sahithya' ? 'സാഹിത്യം മാത്രം' : (rupathaTypeMode === 'kalaa' ? 'കല മാത്രം' : 'രണ്ടും (Sahithya & Kalaa)');

    const dynamicFilename = buildExportFilename('Rupatha_Competition_1st_2nd_Winners', {
      mode: rupathaTypeMode,
      parish: rupathaParishFilter || 'All_Parishes',
      category: rupathaCategoryFilter || 'All_Categories',
      gender: rupathaGenderFilter || 'All_Genders',
      item: rupathaItemFilter || 'All_Items'
    });

    const pageTitle = dynamicFilename.replace(/\.pdf$/i, '');
    const totalCols = 8 + (incRegSlNoInRupathaPrint ? 1 : 0) + (incMemNoInRupathaPrint ? 1 : 0) + (incChestNoInRupathaPrint ? 1 : 0);

    const rows = sorted.map((r, idx) => {
      const isGroup = r.itemType === 'group' || !r.participantId;
      const p = participants.find(part => part.id === r.participantId);
      const nameStr = isGroup ? `ഗ്രൂപ്പ് ടീം (${r.parish})` : (p ? p.name : (r.name || '-'));
      const houseStr = !isGroup && p?.houseName ? p.houseName : '';
      const chestStr = r.chestNumber || (p ? p.chestNumber : '') || '-';
      const ageCategoryKey = r.ageCategory || (p ? calculateAgeGroup(p.dob) : null);
      const ageCategoryStr = isGroup ? '-' : (AGE_GROUPS_SHORT_ENG[ageCategoryKey] || ageCategoryKey || '-');
      const genderVal = r.gender || (p ? p.gender : null);
      const genderStr = isGroup ? '-' : (genderVal === 'male' ? 'Male' : (genderVal === 'female' ? 'Female' : '-'));
      const posLabel = r.position === '1' ? '1st Rank' : (r.position === '2' ? '2nd Rank' : `${r.position}`);
      const posBg = r.position === '1' ? '#fef3c7' : '#f1f5f9';
      const posColor = r.position === '1' ? '#b45309' : '#475569';

      const regSlNoCell = incRegSlNoInRupathaPrint ? `<td style="text-align:center;border:1px solid #334155;">${(!isGroup && p?.registerSlNo) ? p.registerSlNo : '-'}</td>` : '';
      const memNoCell = incMemNoInRupathaPrint ? `<td style="text-align:center;border:1px solid #334155;">${(!isGroup && p?.membershipNo) ? p.membershipNo : '-'}</td>` : '';
      const chestCell = incChestNoInRupathaPrint ? `<td style="text-align:center;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${chestStr}</td>` : '';

      return `
        <tr>
          <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
          ${regSlNoCell}
          ${memNoCell}
          ${chestCell}
          <td style="border:1px solid #334155;font-weight:bold;">${getItemDisplayName(r.itemName)} ${isGroup ? '(ഗ്രൂപ്പ്)' : ''}</td>
          <td style="text-align:center;border:1px solid #334155;">${ageCategoryStr}</td>
          <td style="text-align:center;border:1px solid #334155;">${genderStr}</td>
          <td style="border:1px solid #334155;">
            <div style="font-weight:bold;font-size:10.5pt;">${nameStr}</div>
            ${houseStr ? `<div style="font-size:8.5pt;color:#555;">${houseStr}</div>` : ''}
          </td>
          <td style="border:1px solid #334155;">${r.parish}</td>
          <td style="text-align:center;font-weight:bold;border:1px solid #334155;font-size:10pt;background-color:${posBg};color:${posColor};">${posLabel}</td>
          <td style="text-align:center;font-weight:800;border:1px solid #334155;font-size:10pt;">${r.grade || '-'}</td>
        </tr>`;
    }).join('');

    const firstCount = sorted.filter(r => r.position === '1').length;
    const secondCount = sorted.filter(r => r.position === '2').length;

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { 
      size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'}; 
      margin: 8mm 10mm 8mm 10mm; 
    }
    body {
      font-family: 'Noto Sans Malayalam', 'Inter', sans-serif;
      margin: 0;
      padding: 0;
      color: #0f172a;
      background: #ffffff;
      -webkit-print-color-adjust: exact;
      print-color-adjust: exact;
    }
    .print-table {
      width: 100%;
      border-collapse: collapse;
      font-size: ${isLandscape ? '9.5pt' : '9pt'};
    }
    .print-table th {
      background: #1e3a8a !important;
      color: #ffffff !important;
      border: 1.5px solid #0f172a;
      padding: 6px 6px;
      font-weight: 700;
    }
    .print-table td {
      padding: 5px 6px;
      vertical-align: middle;
    }
    .header-container {
      background: #ffffff !important;
      border: none !important;
      padding: 0 0 8px 0 !important;
    }
    .title-banner {
      border-bottom: 2.5px solid #7c3aed;
      padding-bottom: 6px;
      margin-bottom: 6px;
    }
    .title-banner h1 {
      margin: 0;
      font-size: 15pt;
      color: #1e3a8a;
      font-weight: 800;
    }
    .title-banner p.sub-title {
      margin: 3px 0 0 0;
      font-size: 11pt;
      color: #7c3aed;
      font-weight: 700;
    }
    .filter-summary {
      font-size: 8.5pt;
      color: #334155;
      background: #f8fafc;
      padding: 5px 8px;
      border: 1px solid #cbd5e1;
      border-radius: 4px;
      margin-top: 4px;
      font-weight: 600;
      display: flex;
      flex-wrap: wrap;
      gap: 12px;
    }
    .page-footer-note {
      margin-top: 10px;
      font-size: 8pt;
      color: #64748b;
      display: flex;
      justify-content: space-between;
      border-top: 1px solid #e2e8f0;
      padding-top: 4px;
    }
  </style>
</head>
<body>
  <table class="print-table">
    <colgroup>
      <col style="width: ${isLandscape ? '42px' : '36px'};" />
      ${incRegSlNoInRupathaPrint ? `<col style="width: ${isLandscape ? '80px' : '70px'};"` : ''}
      ${incMemNoInRupathaPrint ? `<col style="width: ${isLandscape ? '80px' : '70px'};"` : ''}
      ${incChestNoInRupathaPrint ? `<col style="width: ${isLandscape ? '80px' : '70px'};"` : ''}
      <col style="width: ${isLandscape ? '160px' : '120px'};" />
      <col style="width: ${isLandscape ? '95px' : '80px'};" />
      <col style="width: ${isLandscape ? '70px' : '60px'};" />
      <col style="width: auto;" />
      <col style="width: ${isLandscape ? '140px' : '105px'};" />
      <col style="width: ${isLandscape ? '80px' : '70px'};" />
      <col style="width: ${isLandscape ? '70px' : '60px'};" />
    </colgroup>
    <thead>
      <tr>
        <th colspan="${totalCols}" class="header-container">
          <div class="title-banner">
            <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
            <p class="sub-title">🏆 രൂപത മത്സരാർത്ഥികളുടെ പട്ടിക (1st & 2nd Winners)</p>
            <div class="filter-summary">
              <span>ഇടവക: <strong>${parishLabel}</strong></span>
              <span>വിഭാഗം: <strong>${categoryLabel}</strong></span>
              <span>ഇനം: <strong>${itemLabel}</strong></span>
              <span>ജെൻഡർ: <strong>${genderLabel}</strong></span>
              <span>വിഭാഗ തരം: <strong>${catModeLabel}</strong></span>
            </div>
          </div>
        </th>
      </tr>
      <tr>
        <th style="text-align:center;">ക്രമ നം.</th>
        ${incRegSlNoInRupathaPrint ? '<th style="text-align:center;">ലിസ്റ്റ് നം.</th>' : ''}
        ${incMemNoInRupathaPrint ? '<th style="text-align:center;">അംഗത്വ നം.</th>' : ''}
        ${incChestNoInRupathaPrint ? '<th style="text-align:center;">ചെസ്റ്റ് നം.</th>' : ''}
        <th>മത്സര ഇനം (Item)</th>
        <th style="text-align:center;">വിഭാഗം</th>
        <th style="text-align:center;">ജെൻഡർ</th>
        <th>പേര് & വീട്ടുപേര്</th>
        <th>ഇടവക</th>
        <th style="text-align:center;">സ്ഥാനം</th>
        <th style="text-align:center;">ഗ്രേഡ്</th>
      </tr>
    </thead>
    <tbody>${rows || `<tr><td colspan="${totalCols}" style="text-align:center;padding:12px;">രൂപത മത്സരത്തിനായി ഫിൽട്ടറുകൾക്കനുസരിച്ചുള്ള 1st & 2nd സ്ഥാനക്കാരെ ഒന്നും കണ്ടെത്തിയില്ല.</td></tr>`}</tbody>
    ${sorted.length > 0 ? `
    <tfoot>
      <tr style="background:#fef3c7;font-weight:bold;">
        <td colspan="${totalCols}" style="text-align:center;padding:9px 14px;font-size:10.5pt;color:#b45309;border:1.5px solid #0f172a;">
          ആകെ രൂപത മത്സരാർത്ഥികൾ: ${sorted.length} (1st Rank: ${firstCount} &bull; 2nd Rank: ${secondCount})
        </td>
      </tr>
    </tfoot>` : ''}
  </table>
  <div class="page-footer-note">
    <div>ചെറുപുഷ്പ മിഷൻ ലീഗ് &bull; രൂപത മത്സരം (1st & 2nd Winners)</div>
    <div>തീയതി: ${new Date().toLocaleDateString('en-GB')} ${new Date().toLocaleTimeString()}</div>
  </div>
</body>
</html>`;

    executePrintOrPdf(htmlContent, dynamicFilename, isLandscape, action);
  };

  // Master Filtered List for Rupatha Competition (Strictly 1st and 2nd Position Holders)
    // Print Allocated Chest Numbers List
  const handlePrintAllottedChestList = (action = 'print') => {
    const isGroup = allottedTab === 'group';
    let rowsHtml = '';
    let totalCount = 0;

    if (!isGroup) {
      let list = [...participants];
      if (allottedStatusFilter === 'allotted') list = list.filter(p => p.chestNumber);
      else if (allottedStatusFilter === 'pending') list = list.filter(p => !p.chestNumber);
      if (allottedParishFilter) list = list.filter(p => p.parish === allottedParishFilter);
      if (allottedCategoryFilter) list = list.filter(p => calculateAgeGroup(p.dob) === allottedCategoryFilter);
      if (allottedSearch) {
        const q = allottedSearch.toLowerCase();
        list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.chestNumber || '').includes(q) || (p.parish || '').toLowerCase().includes(q));
      }

      list.sort((a, b) => {
        const na = parseInt(a.chestNumber) || 999999;
        const nb = parseInt(b.chestNumber) || 999999;
        if (na !== nb) return na - nb;
        return (a.name || '').localeCompare(b.name || '');
      });

      totalCount = list.length;
      rowsHtml = list.map((p, idx) => `
        <tr>
          <td style="text-align:center;font-weight:bold;border:1px solid #334155;">${idx + 1}</td>
          <td style="text-align:center;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${p.chestNumber || '-'}</td>
          <td style="border:1px solid #334155;"><strong>${p.name}</strong><div style="font-size:0.85em;color:#555;">${p.houseName || ''}</div></td>
          <td style="border:1px solid #334155;">${p.parish || ''}</td>
          <td style="text-align:center;border:1px solid #334155;">${AGE_GROUPS_SHORT_ENG[calculateAgeGroup(p.dob)] || '-'}</td>
          <td style="text-align:center;border:1px solid #334155;">${p.gender === 'male' ? 'M' : 'F'}</td>
        </tr>`).join('');
    } else {
      let gList = [];
      const currentGroupChestNumbers = db?.years?.[currentYear]?.groupChestNumbers || {};
      const allGroupItemIds = ['k_parichamuttu', 'k_margamkali', 'k_bible_drisya', 'k_mission_anthem', 'k_group_song'];
      
      allGroupItemIds.forEach(itemId => {
        const parMap = {};
        participants.forEach(p => {
          if ((p.registeredGroupItems || []).includes(itemId)) {
            if (!parMap[p.parish]) parMap[p.parish] = [];
            parMap[p.parish].push(p);
          }
        });

        Object.keys(parMap).forEach(parish => {
          const cNum = currentGroupChestNumbers?.[itemId]?.[parish] || '';
          gList.push({ itemId, parish, memberCount: parMap[parish].length, chestNumber: cNum });
        });
      });

      if (allottedStatusFilter === 'allotted') gList = gList.filter(g => g.chestNumber);
      else if (allottedStatusFilter === 'pending') gList = gList.filter(g => !g.chestNumber);
      if (allottedParishFilter) gList = gList.filter(g => g.parish === allottedParishFilter);
      if (allottedSearch) {
        const q = allottedSearch.toLowerCase();
        gList = gList.filter(g => (g.parish || '').toLowerCase().includes(q) || (g.chestNumber || '').includes(q) || (ITEM_NAMES_MAP[g.itemId] || '').toLowerCase().includes(q));
      }

      gList.sort((a, b) => {
        const na = parseInt(a.chestNumber) || 999999;
        const nb = parseInt(b.chestNumber) || 999999;
        if (na !== nb) return na - nb;
        return (a.parish || '').localeCompare(b.parish || '');
      });

      totalCount = gList.length;
      rowsHtml = gList.map((g, idx) => `
        <tr>
          <td style="text-align:center;font-weight:bold;border:1px solid #334155;">${idx + 1}</td>
          <td style="text-align:center;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${g.chestNumber || '-'}</td>
          <td style="border:1px solid #334155;font-weight:bold;">${ITEM_NAMES_MAP[g.itemId] || g.itemId}</td>
          <td style="border:1px solid #334155;font-weight:bold;">${g.parish}</td>
          <td style="text-align:center;border:1px solid #334155;">${g.memberCount} അംഗങ്ങൾ</td>
        </tr>`).join('');
    }

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>Allotted Chest Numbers — ${currentYear}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Kartika', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: center; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: 9pt !important; font-weight: 700 !important; padding: 8px 6px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: 8px 6px !important; font-size: 9pt !important; color: #0f172a; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
  </style>
</head>
<body>
  <table class="print-table">
    <thead>
      <tr>
        <th colspan="${isGroup ? 5 : 6}" class="header-container">
          <h1 style="font-size:15pt;margin:0 0 4px 0;color:#1e3a8a;">ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
          <p style="font-size:10pt;font-weight:bold;margin:0;color:#334155;">അലോട്ട് ചെയ്ത ചെസ്റ്റ് നമ്പറുകൾ (${isGroup ? 'ഗ്രൂപ്പ് മത്സരങ്ങൾ' : 'വ്യക്തിഗത മത്സരങ്ങൾ'})</p>
        </th>
      </tr>
      <tr class="col-header">
        <th style="width:45px;">Sl. No.</th>
        <th style="width:95px;">ചെസ്റ്റ് നം.</th>
        ${!isGroup ? '<th>പേര് & വീട്ടുപേര് (Name)</th><th>ഇടവക (Parish)</th><th style="width:80px;">വിഭാഗം</th><th style="width:50px;">ജെൻഡർ</th>' : '<th style="text-align:left;">ഗ്രൂപ്പ് ഇനം</th><th style="text-align:left;">ഇടവക (Parish)</th><th style="width:110px;">ടീം അംഗങ്ങൾ</th>'}
      </tr>
    </thead>
    <tbody>${rowsHtml || '<tr><td colspan="6" style="text-align:center;padding:15px;">വിവരങ്ങളൊന്നും ലഭ്യമല്ല.</td></tr>'}</tbody>
  </table>
  <div style="margin-top:10px;text-align:right;font-size:8.5pt;color:#64748b;font-weight:bold;">
    ആകെ എണ്ണം: ${totalCount}
  </div>
</body>
</html>`;

    executePrintOrPdf(htmlContent, `Allotted_Chest_Numbers_${currentYear}.pdf`, false, action);
  };

  // Print Leaderboard — opens a clean popup with Malayalam heading and prints
  const handlePrintLeaderboard = (action = 'print') => {
    const rows = standings.map((st) => {
      const medal = st.rank === 1 ? '🥇' : st.rank === 2 ? '🥈' : st.rank === 3 ? '🥉' : '';
      const rankDisplay = medal ? `${medal} ${st.rank}` : st.rank;
      return `<tr>
        <td style="text-align:center;font-weight:bold;border:1px solid #334155;">${rankDisplay}</td>
        <td style="border:1px solid #334155;"><strong>${st.parish}</strong></td>
        <td style="text-align:center;border:1px solid #334155;">${st.sahithya}</td>
        <td style="text-align:center;border:1px solid #334155;">${st.kalaa}</td>
        <td style="text-align:center;font-size:1.1rem;font-weight:bold;color:#1e3a8a;border:1px solid #334155;">${st.total}</td>
      </tr>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>${buildExportFilename('Leaderboard', { extra: 'Overall_Standings' }).replace(/\.pdf$/i, '')}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Inter', Arial, sans-serif; }
    body { font-family: 'Noto Sans Malayalam', 'Segoe UI', Arial, sans-serif; padding: 0; margin: 0; color: #0f172a; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table { width: 100%; border-collapse: collapse; margin-top: 0; }
    thead { display: table-header-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    th, td { border: 1px solid #334155; box-sizing: border-box; }
    .header-cell { border: none !important; padding: 0 0 12px 0 !important; text-align: center; background: transparent !important; color: #0f172a !important; }
    .header-cell h1 { font-size: 16pt; margin: 0 0 4px 0; color: #1e3a8a; font-weight: 800; }
    .header-cell h2 { font-size: 11pt; color: #334155; margin: 0; font-weight: 600; }
    .col-header th { background: #1e3a8a !important; color: #fff !important; padding: 9px 12px; font-size: 9.5pt; font-weight: 700; text-align: center; border: 1.5px solid #0f172a !important; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    td { padding: 9px 12px; font-size: 9.5pt; border: 1px solid #334155 !important; }
    tbody tr:nth-child(even) { background: #f8fafc; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    tbody tr:nth-child(1) td { background: #fffbea; font-weight: 700; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    tbody tr:nth-child(2) td { background: #f0f4ff; font-weight: 600; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    tbody tr:nth-child(3) td { background: #f0fff4; font-weight: 600; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <table>
    <thead>
      <tr>
        <th colspan="5" class="header-cell">
          <h1>കലാ സാഹിത്യ മത്സര ഫലങ്ങൾ &mdash; ലീഡർബോർഡ്</h1>
          <h2>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h2>
        </th>
      </tr>
      <tr class="col-header">
        <th style="width:65px;text-align:center;">റാങ്ക്</th>
        <th style="text-align:left;">ഇടവക / യൂണിറ്റ് (Parish)</th>
        <th style="width:110px;text-align:center;">സാഹിത്യം</th>
        <th style="width:110px;text-align:center;">കല</th>
        <th style="width:130px;text-align:center;">ആകെ പോയിന്റ്</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div style="margin-top:12px;text-align:right;font-size:8.5pt;color:#64748b;font-weight:600;">
    ചെറുപുഷ്പ മിഷൻ ലീഗ് (CML) &bull; ലീഡർബോർഡ് ${currentYear}
  </div>
</body>
</html>`;

    const dynamicFilename = buildExportFilename('Leaderboard', { extra: 'Overall_Standings' });
    executePrintOrPdf(htmlContent, dynamicFilename, false, action);
  };

  // 1. Evaluation Sheet Print & WhatsApp Delivery
  const handlePrintEvaluationSheet = (action = 'print') => {
    const parishLabel = partFilterMode === 'simple'
      ? (partParishFilter || 'എല്ലാ ഇടവകകളും (All)')
      : (partSelectedParishes.length === 0 ? 'എല്ലാ ഇടവകകളും (All)' : partSelectedParishes.join(', '));

    const categoryLabel = partFilterMode === 'simple'
      ? (partCategoryFilter ? (AGE_GROUPS[partCategoryFilter] || partCategoryFilter) : 'എല്ലാ വിഭാഗങ്ങളും (All)')
      : (partSelectedCategories.length === 0 ? 'എല്ലാ വിഭാഗങ്ങളും (All)' : partSelectedCategories.map(k => AGE_GROUPS[k] || k).join(', '));

    const itemLabel = partFilterMode === 'simple'
      ? (partItemFilter ? getItemDisplayName(partItemFilter) : 'എല്ലാ ഇനങ്ങളും (All)')
      : (partSelectedItems.length === 0 ? 'എല്ലാ ഇനങ്ങളും (All)' : partSelectedItems.map(id => getItemDisplayName(id)).join(', '));

    const genderLabel = partFilterMode === 'simple'
      ? (partGenderFilter === 'male' ? 'ആൺകുട്ടി (Male)' : partGenderFilter === 'female' ? 'പെൺകുട്ടി (Female)' : 'എല്ലാ ജെൻഡറുകളും (All)')
      : (partSelectedGenders.length === 0 ? 'എല്ലാ ജെൻഡറുകളും (All)' : partSelectedGenders.map(g => g === 'male' ? 'Male' : 'Female').join(', '));

    const dynamicFilename = buildExportFilename('Evaluation_Sheet', {
      parish: partFilterMode === 'simple' ? partParishFilter : (partSelectedParishes.length === 1 ? partSelectedParishes[0] : ''),
      category: partFilterMode === 'simple' ? partCategoryFilter : (partSelectedCategories.length === 1 ? partSelectedCategories[0] : ''),
      gender: partFilterMode === 'simple' ? partGenderFilter : (partSelectedGenders.length === 1 ? partSelectedGenders[0] : ''),
      item: partFilterMode === 'simple' ? partItemFilter : (partSelectedItems.length === 1 ? partSelectedItems[0] : '')
    });

    const pageTitle = dynamicFilename.replace(/\.pdf$/i, '');

    const sorted = [...filteredParticipants].sort((a, b) => {
      const na = parseInt(a.chestNumber) || 0;
      const nb = parseInt(b.chestNumber) || 0;
      return na - nb;
    });

    const rows = sorted.map((p, idx) => `
      <tr>
        <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
        <td style="text-align:center;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${p.chestNumber || '-'}</td>
        <td style="border:1px solid #334155;"></td>
        <td style="border:1px solid #334155;"></td>
      </tr>`).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Kartika', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: left; background: transparent !important; color: #0f172a !important; }
    .title-banner { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    .title-banner h1 { font-size: 15pt; margin: 0 0 3px 0; color: #1e3a8a; font-weight: 800; }
    .title-banner .sub-title { font-size: 10pt; font-weight: 600; color: #334155; margin: 0; }
    .title-banner .sheet-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 2px 10px; border-radius: 4px; font-size: 9pt; font-weight: 700; margin-left: 6px; }
    .meta-card { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 10px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px; }
    .meta-box-left { border-right: 1.5px solid #e2e8f0; padding-right: 10px; display: flex; flex-direction: column; gap: 4px; }
    .meta-box-right { padding-left: 4px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; }
    .meta-label { font-size: 7.5pt; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
    .meta-value { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
    .meta-value.highlight-item { font-size: 10.5pt; color: #1e3a8a; }
    .meta-sub-row { display: flex; gap: 14px; }
    .total-badge-box { display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 6px; padding: 4px 8px; }
    .total-badge-label { font-size: 8pt; font-weight: 700; color: #1e40af; }
    .total-badge-number { font-size: 10.5pt; font-weight: 800; color: #1e3a8a; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #93c5fd; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: 8.8pt !important; font-weight: 700 !important; padding: 7px 8px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: 9px 8px !important; font-size: 9pt !important; color: #0f172a; box-sizing: border-box; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
    .page-footer-note { margin-top: 8px; font-size: 8pt; color: #64748b; text-align: right; font-weight: 600; page-break-inside: avoid; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <table class="print-table">
    <thead>
      <tr>
        <th colspan="4" class="header-container">
          <div class="title-banner">
            <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
            <p class="sub-title">
              കലാ സാഹിത്യ ground &bull; <span class="sheet-badge">EVALUATION SHEET (മൂല്യനിർണ്ണയ ഷീറ്റ്)</span>
            </p>
          </div>
          <div class="meta-card">
            <div class="meta-box-left">
              <div>
                <div class="meta-label">മത്സര ഇനം (Competition Item)</div>
                <div class="meta-value highlight-item">${itemLabel}</div>
              </div>
              <div class="meta-sub-row">
                <div>
                  <div class="meta-label">വിഭാഗം (Category)</div>
                  <div class="meta-value">${categoryLabel}</div>
                </div>
                <div>
                  <div class="meta-label">ജെൻഡർ (Gender)</div>
                  <div class="meta-value">${genderLabel}</div>
                </div>
              </div>
            </div>
            <div class="meta-box-right">
              <div>
                <div class="meta-label">ഇടവക / യൂണിറ്റ് (Parish)</div>
                <div class="meta-value">${parishLabel}</div>
              </div>
              <div class="total-badge-box">
                <span class="total-badge-label">ആകെ മത്സരാർത്ഥികൾ:</span>
                <span class="total-badge-number">${sorted.length} പേർ</span>
              </div>
            </div>
          </div>
        </th>
      </tr>
      <tr class="col-header">
        <th style="width:55px;">Sl. No.</th>
        <th style="width:105px;">Chest No.</th>
        <th style="width:140px;">Mark (മാർക്ക്)</th>
        <th style="text-align:left;padding-left:12px!important;">Remarks (റിമാർക്കുകൾ)</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="page-footer-note">
    ചെറുപുഷ്പ മിഷൻ ലീഗ് &bull; ആകെ മത്സരാർത്ഥികൾ: ${sorted.length} പേർ
  </div>
</body>
</html>`;

    executePrintOrPdf(htmlContent, dynamicFilename, false, action);
  };

  // 2. Result Sheet Print & WhatsApp Delivery
  const handlePrintResultSheet = (action = 'print') => {
    const parishLabel = partFilterMode === 'simple'
      ? (partParishFilter || 'എല്ലാ ഇടവകകളും (All)')
      : (partSelectedParishes.length === 0 ? 'എല്ലാ ഇടവകകളും (All)' : partSelectedParishes.join(', '));

    const categoryLabel = partFilterMode === 'simple'
      ? (partCategoryFilter ? (AGE_GROUPS[partCategoryFilter] || partCategoryFilter) : 'എല്ലാ വിഭാഗങ്ങളും (All)')
      : (partSelectedCategories.length === 0 ? 'എല്ലാ വിഭാഗങ്ങളും (All)' : partSelectedCategories.map(k => AGE_GROUPS[k] || k).join(', '));

    const itemLabel = partFilterMode === 'simple'
      ? (partItemFilter ? getItemDisplayName(partItemFilter) : 'എല്ലാ ഇനങ്ങളും (All)')
      : (partSelectedItems.length === 0 ? 'എല്ലാ ഇനങ്ങളും (All)' : partSelectedItems.map(id => getItemDisplayName(id)).join(', '));

    const genderLabel = partFilterMode === 'simple'
      ? (partGenderFilter === 'male' ? 'ആൺകുട്ടി (Male)' : partGenderFilter === 'female' ? 'പെൺകുട്ടി (Female)' : 'എല്ലാ ജെൻഡറുകളും (All)')
      : (partSelectedGenders.length === 0 ? 'എല്ലാ ജെൻഡറുകളും (All)' : partSelectedGenders.map(g => g === 'male' ? 'Male' : 'Female').join(', '));

    const dynamicFilename = buildExportFilename('Result_Sheet', {
      parish: partFilterMode === 'simple' ? partParishFilter : (partSelectedParishes.length === 1 ? partSelectedParishes[0] : ''),
      category: partFilterMode === 'simple' ? partCategoryFilter : (partSelectedCategories.length === 1 ? partSelectedCategories[0] : ''),
      gender: partFilterMode === 'simple' ? partGenderFilter : (partSelectedGenders.length === 1 ? partSelectedGenders[0] : ''),
      item: partFilterMode === 'simple' ? partItemFilter : (partSelectedItems.length === 1 ? partSelectedItems[0] : '')
    });

    const pageTitle = dynamicFilename.replace(/\.pdf$/i, '');

    const sorted = [...filteredParticipants].sort((a, b) => {
      const na = parseInt(a.chestNumber) || 0;
      const nb = parseInt(b.chestNumber) || 0;
      return na - nb;
    });

    const rows = sorted.map((p, idx) => `
      <tr>
        <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
        <td style="text-align:center;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${p.chestNumber || '-'}</td>
        <td style="border:1px solid #334155;"></td>
        <td style="border:1px solid #334155;"></td>
        <td style="border:1px solid #334155;"></td>
        <td style="border:1px solid #334155;"></td>
        <td style="border:1px solid #334155;"></td>
        <td style="border:1px solid #334155;"></td>
      </tr>`).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Kartika', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: left; background: transparent !important; color: #0f172a !important; }
    .title-banner { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    .title-banner h1 { font-size: 15pt; margin: 0 0 3px 0; color: #1e3a8a; font-weight: 800; }
    .title-banner .sub-title { font-size: 10pt; font-weight: 600; color: #334155; margin: 0; }
    .title-banner .sheet-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 2px 10px; border-radius: 4px; font-size: 9pt; font-weight: 700; margin-left: 6px; }
    .meta-card { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 10px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px; }
    .meta-box-left { border-right: 1.5px solid #e2e8f0; padding-right: 10px; display: flex; flex-direction: column; gap: 4px; }
    .meta-box-right { padding-left: 4px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; }
    .meta-label { font-size: 7.5pt; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
    .meta-value { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
    .meta-value.highlight-item { font-size: 10.5pt; color: #1e3a8a; }
    .meta-sub-row { display: flex; gap: 14px; }
    .total-badge-box { display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 6px; padding: 4px 8px; }
    .total-badge-label { font-size: 8pt; font-weight: 700; color: #1e40af; }
    .total-badge-number { font-size: 10.5pt; font-weight: 800; color: #1e3a8a; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #93c5fd; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: 8.5pt !important; font-weight: 700 !important; padding: 7px 6px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: 9px 6px !important; font-size: 9pt !important; color: #0f172a; box-sizing: border-box; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
    .page-footer-note { margin-top: 8px; font-size: 8pt; color: #64748b; text-align: right; font-weight: 600; page-break-inside: avoid; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <table class="print-table">
    <thead>
      <tr>
        <th colspan="8" class="header-container">
          <div class="title-banner">
            <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
            <p class="sub-title">
              കലാ സാഹിത്യ ground &bull; <span class="sheet-badge">RESULT SHEET (ഫലങ്ങളുടെ പട്ടിക)</span>
            </p>
          </div>
          <div class="meta-card">
            <div class="meta-box-left">
              <div>
                <div class="meta-label">മത്സര ഇനം (Competition Item)</div>
                <div class="meta-value highlight-item">${itemLabel}</div>
              </div>
              <div class="meta-sub-row">
                <div>
                  <div class="meta-label">വിഭാഗം (Category)</div>
                  <div class="meta-value">${categoryLabel}</div>
                </div>
                <div>
                  <div class="meta-label">ജെൻഡർ (Gender)</div>
                  <div class="meta-value">${genderLabel}</div>
                </div>
              </div>
            </div>
            <div class="meta-box-right">
              <div>
                <div class="meta-label">ഇടവക / യൂണിറ്റ് (Parish)</div>
                <div class="meta-value">${parishLabel}</div>
              </div>
              <div class="total-badge-box">
                <span class="total-badge-label">ആകെ മത്സരാർത്ഥികൾ:</span>
                <span class="total-badge-number">${sorted.length} പേർ</span>
              </div>
            </div>
          </div>
        </th>
      </tr>
      <tr class="col-header">
        <th style="width:45px;">Sl. No.</th>
        <th style="width:85px;">Chest No.</th>
        <th style="width:80px;">Judge 1</th>
        <th style="width:80px;">Judge 2</th>
        <th style="width:80px;">Judge 3</th>
        <th style="width:80px;">Total</th>
        <th style="width:100px;">Place (സ്ഥാനം)</th>
        <th style="width:80px;">Grade</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="page-footer-note">
    ചെറുപുഷ്പ മിഷൻ ലീഗ് &bull; ആകെ മത്സരാർത്ഥികൾ: ${sorted.length} പേർ
  </div>
</body>
</html>`;

    executePrintOrPdf(htmlContent, dynamicFilename, false, action);
  };

  // 3. Lot Sheet Print & WhatsApp Delivery
  const handlePrintLotSheet = (action = 'print') => {
    const parishLabel = partFilterMode === 'simple'
      ? (partParishFilter || 'എല്ലാ ഇടവകകളും (All)')
      : (partSelectedParishes.length === 0 ? 'എല്ലാ ഇടവകകളും (All)' : partSelectedParishes.join(', '));

    const categoryLabel = partFilterMode === 'simple'
      ? (partCategoryFilter ? (AGE_GROUPS[partCategoryFilter] || partCategoryFilter) : 'എല്ലാ വിഭാഗങ്ങളും (All)')
      : (partSelectedCategories.length === 0 ? 'എല്ലാ വിഭാഗങ്ങളും (All)' : partSelectedCategories.map(k => AGE_GROUPS[k] || k).join(', '));

    const itemLabel = partFilterMode === 'simple'
      ? (partItemFilter ? getItemDisplayName(partItemFilter) : 'എല്ലാ ഇനങ്ങളും (All)')
      : (partSelectedItems.length === 0 ? 'എല്ലാ ഇനങ്ങളും (All)' : partSelectedItems.map(id => getItemDisplayName(id)).join(', '));

    const genderLabel = partFilterMode === 'simple'
      ? (partGenderFilter === 'male' ? 'ആൺകുട്ടി (Male)' : partGenderFilter === 'female' ? 'പെൺകുട്ടി (Female)' : 'എല്ലാ ജെൻഡറുകളും (All)')
      : (partSelectedGenders.length === 0 ? 'എല്ലാ ജെൻഡറുകളും (All)' : partSelectedGenders.map(g => g === 'male' ? 'Male' : 'Female').join(', '));

    const dynamicFilename = buildExportFilename('Lot_Sheet', {
      parish: partFilterMode === 'simple' ? partParishFilter : (partSelectedParishes.length === 1 ? partSelectedParishes[0] : ''),
      category: partFilterMode === 'simple' ? partCategoryFilter : (partSelectedCategories.length === 1 ? partSelectedCategories[0] : ''),
      gender: partFilterMode === 'simple' ? partGenderFilter : (partSelectedGenders.length === 1 ? partSelectedGenders[0] : ''),
      item: partFilterMode === 'simple' ? partItemFilter : (partSelectedItems.length === 1 ? partSelectedItems[0] : '')
    });

    const pageTitle = dynamicFilename.replace(/\.pdf$/i, '');

    const sorted = [...filteredParticipants].sort((a, b) => {
      const na = parseInt(a.chestNumber) || 0;
      const nb = parseInt(b.chestNumber) || 0;
      return na - nb;
    });

    const isLandscape = Boolean(incRegSlNoInPrint || incMemNoInPrint);
    const totalCols = 8 + (incRegSlNoInPrint ? 1 : 0) + (incMemNoInPrint ? 1 : 0);

    const rows = sorted.map((p, idx) => {
      const ageCategoryStr = AGE_GROUPS_SHORT_ENG[calculateAgeGroup(p.dob)] || '-';
      const genderStr = p.gender === 'male' ? 'M' : 'F';
      
      let itemsStr = '';
      if (partFilterMode === 'simple' && partItemFilter) {
        itemsStr = getItemDisplayName(partItemFilter);
      } else if (partFilterMode === 'multi' && partSelectedItems.length > 0) {
        const matching = (p.registeredItems || []).concat(p.registeredGroupItems || []).filter(id => partSelectedItems.includes(id));
        itemsStr = matching.length > 0 ? matching.map(getItemDisplayName).join(', ') : (p.registeredItems || []).map(getItemDisplayName).join(', ');
      } else {
        itemsStr = (p.registeredItems || []).concat(p.registeredGroupItems || []).map(getItemDisplayName).join(', ');
      }

      const regSlNoCell = incRegSlNoInPrint ? `<td style="text-align:center;border:1px solid #334155;font-weight:700;">${p.registerSlNo || '-'}</td>` : '';
      const memNoCell = incMemNoInPrint ? `<td style="text-align:center;border:1px solid #334155;font-weight:700;">${p.membershipNo || '-'}</td>` : '';

      return `
        <tr>
          <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
          ${regSlNoCell}
          ${memNoCell}
          <td style="border:1px solid #334155;">
            <div style="font-weight:bold;">${p.name}</div>
            <div style="font-size:0.85em;color:#555;">${p.houseName || ''}</div>
          </td>
          <td style="border:1px solid #334155;">${p.parish || ''}</td>
          <td style="text-align:center;border:1px solid #334155;">${ageCategoryStr}</td>
          <td style="text-align:center;border:1px solid #334155;">${genderStr}</td>
          <td style="border:1px solid #334155;">${itemsStr}</td>
          <td style="text-align:center;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${p.chestNumber || '-'}</td>
          <td style="border:1px solid #334155;"></td>
        </tr>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>${pageTitle}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { 
      size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'}; 
      margin: ${isLandscape ? '8mm 10mm 8mm 10mm' : '8mm 10mm 8mm 10mm'}; 
    }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Kartika', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { 
      width: 100%; 
      border-collapse: collapse; 
      page-break-inside: auto; 
      table-layout: fixed; 
      word-wrap: break-word; 
    }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: left; background: transparent !important; color: #0f172a !important; }
    .title-banner { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    .title-banner h1 { font-size: ${isLandscape ? '16pt' : '15pt'}; margin: 0 0 3px 0; color: #1e3a8a; font-weight: 800; }
    .title-banner .sub-title { font-size: 10pt; font-weight: 600; color: #334155; margin: 0; }
    .title-banner .sheet-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 2px 10px; border-radius: 4px; font-size: 9pt; font-weight: 700; margin-left: 6px; }
    .meta-card { display: grid; grid-template-columns: ${isLandscape ? '1.2fr 0.8fr' : '1.1fr 0.9fr'}; gap: 10px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px; }
    .meta-box-left { border-right: 1.5px solid #e2e8f0; padding-right: 10px; display: flex; flex-direction: column; gap: 4px; }
    .meta-box-right { padding-left: 4px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; }
    .meta-label { font-size: 7.5pt; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
    .meta-value { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
    .meta-value.highlight-item { font-size: 10.5pt; color: #1e3a8a; }
    .meta-sub-row { display: flex; gap: 14px; }
    .total-badge-box { display: flex; align-items: center; justify-content: space-between; background: #eff6ff; border: 1.5px solid #bfdbfe; border-radius: 6px; padding: 4px 8px; }
    .total-badge-label { font-size: 8pt; font-weight: 700; color: #1e40af; }
    .total-badge-number { font-size: 10.5pt; font-weight: 800; color: #1e3a8a; background: #ffffff; padding: 2px 8px; border-radius: 4px; border: 1px solid #93c5fd; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: ${isLandscape ? '8.8pt' : '8.2pt'} !important; font-weight: 700 !important; padding: 7px 5px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: ${isLandscape ? '7px 6px' : '6px 4px'} !important; font-size: ${isLandscape ? '9pt' : '8.5pt'} !important; color: #0f172a; box-sizing: border-box; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
    .page-footer-note { margin-top: 8px; font-size: 8pt; color: #64748b; text-align: right; font-weight: 600; page-break-inside: avoid; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  <table class="print-table">
    <colgroup>
      <col style="width: ${isLandscape ? '38px' : '32px'};" />
      ${incRegSlNoInPrint ? `<col style="width: ${isLandscape ? '75px' : '65px'};" />` : ''}
      ${incMemNoInPrint ? `<col style="width: ${isLandscape ? '75px' : '65px'};" />` : ''}
      <col style="width: auto;" />
      <col style="width: ${isLandscape ? '140px' : '110px'};" />
      <col style="width: ${isLandscape ? '80px' : '65px'};" />
      <col style="width: ${isLandscape ? '45px' : '40px'};" />
      <col style="width: ${isLandscape ? '160px' : '120px'};" />
      <col style="width: ${isLandscape ? '75px' : '65px'};" />
      <col style="width: ${isLandscape ? '75px' : '65px'};" />
    </colgroup>
    <thead>
      <tr>
        <th colspan="${totalCols}" class="header-container">
          <div class="title-banner">
            <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
            <p class="sub-title">
              കലാ സാഹിത്യ ground &bull; <span class="sheet-badge">LOT SHEET (ലോട്ട് ഷീറ്റ്)</span>
            </p>
          </div>
          <div class="meta-card">
            <div class="meta-box-left">
              <div>
                <div class="meta-label">മത്സര ഇനം (Competition Item)</div>
                <div class="meta-value highlight-item">${itemLabel}</div>
              </div>
              <div class="meta-sub-row">
                <div>
                  <div class="meta-label">വിഭാഗം (Category)</div>
                  <div class="meta-value">${categoryLabel}</div>
                </div>
                <div>
                  <div class="meta-label">ജെൻഡർ (Gender)</div>
                  <div class="meta-value">${genderLabel}</div>
                </div>
              </div>
            </div>
            <div class="meta-box-right">
              <div>
                <div class="meta-label">ഇടവക / യൂണിറ്റ് (Parish)</div>
                <div class="meta-value">${parishLabel}</div>
              </div>
              <div class="total-badge-box">
                <span class="total-badge-label">ആകെ മത്സരാർത്ഥികൾ:</span>
                <span class="total-badge-number">${sorted.length} പേർ</span>
              </div>
            </div>
          </div>
        </th>
      </tr>
      <tr class="col-header">
        <th>Sl. No.</th>
        ${incRegSlNoInPrint ? '<th>അംഗത്വ ലിസ്റ്റ് നം.</th>' : ''}
        ${incMemNoInPrint ? '<th>അംഗത്വ നം.</th>' : ''}
        <th style="text-align:left;">പേര് & വീട്ടുപേര് (Name & House Name)</th>
        <th style="text-align:left;">ഇടവക (Parish)</th>
        <th>വിഭാഗം</th>
        <th>ലിംഗം</th>
        <th style="text-align:left;">മത്സര ഇനങ്ങൾ</th>
        <th>ചെസ്റ്റ് നം.</th>
        <th>ചാൻസ് നം.</th>
      </tr>
    </thead>
    <tbody>${rows}</tbody>
  </table>
  <div class="page-footer-note">
    ചെറുപുഷ്പ മിഷൻ ലീഗ് &bull; ആകെ മത്സരാർത്ഥികൾ: ${sorted.length} പേർ
  </div>
</body>
</html>`;

    executePrintOrPdf(htmlContent, dynamicFilename, isLandscape, action);
  };

  // Group 1: Print Group Items Roster & WhatsApp Delivery
  const handlePrintGroupRoster = (action = 'print') => {
    const itemLabel = groupPrintItem === 'all' ? 'എല്ലാ ഗ്രൂപ്പ് ഇനങ്ങളും (All Group Items)' : (ITEM_NAMES_MAP[groupPrintItem] || groupPrintItem);
    const parishLabel = groupPrintParish === 'all' ? 'എല്ലാ ഇടവകകളും (All Parishes)' : groupPrintParish;

    let totalParishes = 0;
    let totalMembers = 0;

    groupPrintData.forEach(g => {
      totalParishes += g.parishes.length;
      g.parishes.forEach(p => { totalMembers += p.members.length; });
    });

    const tablesHtml = groupPrintData.map((group, gIdx) => {
      const rows = group.parishes.map((pGroup, idx) => {
        const membersList = pGroup.members.map((m, mIdx) => 
          `${mIdx + 1}. ${m.name}${m.houseName ? ` (${m.houseName})` : ''}`
        ).join('<br/>');

        return `
          <tr>
            <td style="text-align:center;vertical-align:top;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
            <td style="vertical-align:top;font-weight:bold;font-size:0.95rem;border:1px solid #334155;">${pGroup.parish}</td>
            <td style="text-align:center;vertical-align:top;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${pGroup.chestNumber || '-'}</td>
            <td style="vertical-align:top;font-size:0.85rem;line-height:1.4;border:1px solid #334155;">${membersList}</td>
            <td style="text-align:center;vertical-align:top;font-weight:bold;border:1px solid #334155;">${pGroup.members.length}</td>
          </tr>`;
      }).join('');

      return `
        <table class="print-table" style="width:100%;border-collapse:collapse;margin-bottom:24px;page-break-inside:auto;${gIdx > 0 ? 'page-break-before:always;break-before:page;' : ''}">
          <thead>
            <tr>
              <th colspan="5" class="header-container">
                <div class="title-banner">
                  <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
                  <p class="sub-title">
                    ഗ്രൂപ്പ് മത്സരങ്ങൾ &bull; <span class="sheet-badge">GROUP ROSTER (${group.itemName})</span>
                  </p>
                </div>
                <div class="meta-card">
                  <div class="meta-box-left">
                    <div>
                      <div class="meta-label">ഗ്രൂപ്പ് ഇനം (Group Item)</div>
                      <div class="meta-value highlight-item">${group.itemName}</div>
                    </div>
                  </div>
                  <div class="meta-box-right">
                    <div>
                      <div class="meta-label">ഇടവക / യൂണിറ്റ്</div>
                      <div class="meta-value">${parishLabel}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                      <div style="flex:1;text-align:center;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:6px;padding:3px 6px;">
                        <span style="font-size:7.5pt;font-weight:700;color:#1e40af;display:block;">ഇടവകകൾ</span>
                        <strong style="font-size:10pt;color:#1e3a8a;">${group.parishes.length} ഇടവകകൾ</strong>
                      </div>
                      <div style="flex:1;text-align:center;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:6px;padding:3px 6px;">
                        <span style="font-size:7.5pt;font-weight:700;color:#166534;display:block;">ആകെ അംഗങ്ങൾ</span>
                        <strong style="font-size:10pt;color:#15803d;">${totalMembers} പേർ</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            <tr class="col-header">
              <th style="width:45px;">Sl.</th>
              <th style="width:180px;text-align:left;">ഇടവക (Parish)</th>
              <th style="width:100px;">ചെസ്റ്റ് നം.</th>
              <th style="text-align:left;">മത്സരാർത്ഥികൾ (Team Members)</th>
              <th style="width:70px;">അംഗങ്ങൾ</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>Group Items Roster — ${itemLabel}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Inter', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: left; background: transparent !important; color: #0f172a !important; }
    .title-banner { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    .title-banner h1 { font-size: 15pt; margin: 0 0 3px 0; color: #1e3a8a; font-weight: 800; }
    .title-banner .sub-title { font-size: 10pt; font-weight: 600; color: #334155; margin: 0; }
    .title-banner .sheet-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 2px 10px; border-radius: 4px; font-size: 9pt; font-weight: 700; margin-left: 6px; }
    .meta-card { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 10px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px; }
    .meta-box-left { border-right: 1.5px solid #e2e8f0; padding-right: 10px; display: flex; flex-direction: column; gap: 4px; }
    .meta-box-right { padding-left: 4px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; }
    .meta-label { font-size: 7.5pt; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
    .meta-value { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
    .meta-value.highlight-item { font-size: 10.5pt; color: #1e3a8a; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: 8.8pt !important; font-weight: 700 !important; padding: 7px 8px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: 8px 8px !important; font-size: 9pt !important; color: #0f172a; box-sizing: border-box; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
    .footer { margin-top: 10px; font-size: 8pt; color: #64748b; text-align: right; font-weight: 600; page-break-inside: avoid; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${tablesHtml || '<p style="text-align:center;color:#666;">രജിസ്ട്രേഷൻ വിവരങ്ങളൊന്നും ലഭ്യമല്ല.</p>'}
  <div class="footer">ആകെ ഇടവകകൾ: ${totalParishes} | ആകെ മത്സരാർത്ഥികൾ: ${totalMembers} പേർ</div>
</body>
</html>`;


      const dynamicFilename = buildExportFilename('Group_Roster', { item: groupPrintItem, parish: groupPrintParish });
    executePrintOrPdf(htmlContent, dynamicFilename, false, action);
  };

  // Group 2: Print Group Evaluation Sheet & WhatsApp Delivery
  const handlePrintGroupEvaluationSheet = (action = 'print') => {
    const itemLabel = groupPrintItem === 'all' ? 'എല്ലാ ഗ്രൂപ്പ് ഇനങ്ങളും (All Group Items)' : (ITEM_NAMES_MAP[groupPrintItem] || groupPrintItem);
    const parishLabel = groupPrintParish === 'all' ? 'എല്ലാ ഇടവകകളും (All Parishes)' : groupPrintParish;

    let totalParishes = 0;
    let totalMembers = 0;
    groupPrintData.forEach(g => {
      totalParishes += g.parishes.length;
      g.parishes.forEach(p => { totalMembers += p.members.length; });
    });

    const tablesHtml = groupPrintData.map(group => {
      const rows = group.parishes.map((pGroup, idx) => `
        <tr>
          <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
          <td style="font-weight:bold;font-size:0.95rem;border:1px solid #334155;">${pGroup.parish}</td>
          <td style="text-align:center;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${pGroup.chestNumber || '-'}</td>
          <td style="border:1px solid #334155;"></td>
          <td style="border:1px solid #334155;"></td>
        </tr>`).join('');

      return `
        <table class="print-table" style="width:100%;border-collapse:collapse;margin-bottom:24px;page-break-inside:auto;">
          <thead>
            <tr>
              <th colspan="5" class="header-container">
                <div class="title-banner">
                  <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
                  <p class="sub-title">
                    ഗ്രൂപ്പ് മത്സരങ്ങൾ &bull; <span class="sheet-badge">EVALUATION SHEET (${group.itemName})</span>
                  </p>
                </div>
                <div class="meta-card">
                  <div class="meta-box-left">
                    <div>
                      <div class="meta-label">ഗ്രൂപ്പ് ഇനം (Group Event)</div>
                      <div class="meta-value highlight-item">${group.itemName}</div>
                    </div>
                  </div>
                  <div class="meta-box-right">
                    <div>
                      <div class="meta-label">ഇടവക / യൂണിറ്റ്</div>
                      <div class="meta-value">${parishLabel}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                      <div style="flex:1;text-align:center;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:6px;padding:3px 6px;">
                        <span style="font-size:7.5pt;font-weight:700;color:#1e40af;display:block;">ഇടവകകൾ</span>
                        <strong style="font-size:10pt;color:#1e3a8a;">${group.parishes.length} ഇടവകകൾ</strong>
                      </div>
                      <div style="flex:1;text-align:center;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:6px;padding:3px 6px;">
                        <span style="font-size:7.5pt;font-weight:700;color:#166534;display:block;">ആകെ അംഗങ്ങൾ</span>
                        <strong style="font-size:10pt;color:#15803d;">${totalMembers} പേർ</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            <tr class="col-header">
              <th style="width:50px;">Sl. No.</th>
              <th style="width:180px;text-align:left;">ഇടവക (Parish)</th>
              <th style="width:105px;">ചെസ്റ്റ് നം.</th>
              <th style="width:140px;">Mark (മാർക്ക്)</th>
              <th style="text-align:left;">Remarks (റിമാർക്കുകൾ)</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>Group Evaluation Sheet — ${itemLabel}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Inter', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: left; background: transparent !important; color: #0f172a !important; }
    .title-banner { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    .title-banner h1 { font-size: 15pt; margin: 0 0 3px 0; color: #1e3a8a; font-weight: 800; }
    .title-banner .sub-title { font-size: 10pt; font-weight: 600; color: #334155; margin: 0; }
    .title-banner .sheet-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 2px 10px; border-radius: 4px; font-size: 9pt; font-weight: 700; margin-left: 6px; }
    .meta-card { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 10px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px; }
    .meta-box-left { border-right: 1.5px solid #e2e8f0; padding-right: 10px; display: flex; flex-direction: column; gap: 4px; }
    .meta-box-right { padding-left: 4px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; }
    .meta-label { font-size: 7.5pt; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
    .meta-value { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
    .meta-value.highlight-item { font-size: 10.5pt; color: #1e3a8a; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: 8.8pt !important; font-weight: 700 !important; padding: 7px 8px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: 9px 8px !important; font-size: 9pt !important; color: #0f172a; box-sizing: border-box; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
    .footer { margin-top: 10px; font-size: 8pt; color: #64748b; text-align: right; font-weight: 600; page-break-inside: avoid; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${tablesHtml || '<p style="text-align:center;color:#666;">രജിസ്ട്രേഷൻ വിവരങ്ങളൊന്നും ലഭ്യമല്ല.</p>'}
  <div class="footer">മൊത്തം ഇടവകകൾ: ${totalParishes} | ആകെ മത്സരാർത്ഥികൾ: ${totalMembers} പേർ</div>
</body>
</html>`;


      const dynamicFilename = buildExportFilename('Group_Evaluation_Sheet', { item: groupPrintItem });
    executePrintOrPdf(htmlContent, dynamicFilename, false, action);
  };

  // Group 3: Print Group Result Sheet & WhatsApp Delivery
  const handlePrintGroupResultSheet = (action = 'print') => {
    const itemLabel = groupPrintItem === 'all' ? 'എല്ലാ ഗ്രൂപ്പ് ഇനങ്ങളും (All Group Items)' : (ITEM_NAMES_MAP[groupPrintItem] || groupPrintItem);
    const parishLabel = groupPrintParish === 'all' ? 'എല്ലാ ഇടവകകളും (All Parishes)' : groupPrintParish;

    let totalParishes = 0;
    let totalMembers = 0;
    groupPrintData.forEach(g => {
      totalParishes += g.parishes.length;
      g.parishes.forEach(p => { totalMembers += p.members.length; });
    });

    const tablesHtml = groupPrintData.map(group => {
      const rows = group.parishes.map((pGroup, idx) => `
        <tr>
          <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
          <td style="font-weight:bold;font-size:0.95rem;border:1px solid #334155;">${pGroup.parish}</td>
          <td style="text-align:center;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${pGroup.chestNumber || '-'}</td>
          <td style="border:1px solid #334155;"></td>
          <td style="border:1px solid #334155;"></td>
          <td style="border:1px solid #334155;"></td>
          <td style="border:1px solid #334155;"></td>
          <td style="border:1px solid #334155;"></td>
          <td style="border:1px solid #334155;"></td>
        </tr>`).join('');

      return `
        <table class="print-table" style="width:100%;border-collapse:collapse;margin-bottom:24px;page-break-inside:auto;">
          <thead>
            <tr>
              <th colspan="9" class="header-container">
                <div class="title-banner">
                  <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
                  <p class="sub-title">
                    ഗ്രൂപ്പ് മത്സരങ്ങൾ &bull; <span class="sheet-badge">RESULT SHEET (${group.itemName})</span>
                  </p>
                </div>
                <div class="meta-card">
                  <div class="meta-box-left">
                    <div>
                      <div class="meta-label">ഗ്രൂപ്പ് ഇനം (Group Event)</div>
                      <div class="meta-value highlight-item">${group.itemName}</div>
                    </div>
                  </div>
                  <div class="meta-box-right">
                    <div>
                      <div class="meta-label">ഇടവക / യൂണിറ്റ്</div>
                      <div class="meta-value">${parishLabel}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                      <div style="flex:1;text-align:center;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:6px;padding:3px 6px;">
                        <span style="font-size:7.5pt;font-weight:700;color:#1e40af;display:block;">ഇടവകകൾ</span>
                        <strong style="font-size:10pt;color:#1e3a8a;">${group.parishes.length} ഇടവകകൾ</strong>
                      </div>
                      <div style="flex:1;text-align:center;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:6px;padding:3px 6px;">
                        <span style="font-size:7.5pt;font-weight:700;color:#166534;display:block;">ആകെ അംഗങ്ങൾ</span>
                        <strong style="font-size:10pt;color:#15803d;">${totalMembers} പേർ</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            <tr class="col-header">
              <th style="width:45px;">Sl.</th>
              <th style="width:160px;text-align:left;">ഇടവക (Parish)</th>
              <th style="width:85px;">ചെസ്റ്റ് നം.</th>
              <th style="width:75px;">Judge 1</th>
              <th style="width:75px;">Judge 2</th>
              <th style="width:75px;">Judge 3</th>
              <th style="width:75px;">Total</th>
              <th style="width:95px;">Place (സ്ഥാനം)</th>
              <th style="width:75px;">Grade</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>Group Result Sheet — ${itemLabel}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Inter', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: left; background: transparent !important; color: #0f172a !important; }
    .title-banner { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    .title-banner h1 { font-size: 15pt; margin: 0 0 3px 0; color: #1e3a8a; font-weight: 800; }
    .title-banner .sub-title { font-size: 10pt; font-weight: 600; color: #334155; margin: 0; }
    .title-banner .sheet-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 2px 10px; border-radius: 4px; font-size: 9pt; font-weight: 700; margin-left: 6px; }
    .meta-card { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 10px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px; }
    .meta-box-left { border-right: 1.5px solid #e2e8f0; padding-right: 10px; display: flex; flex-direction: column; gap: 4px; }
    .meta-box-right { padding-left: 4px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; }
    .meta-label { font-size: 7.5pt; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
    .meta-value { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
    .meta-value.highlight-item { font-size: 10.5pt; color: #1e3a8a; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: 8.5pt !important; font-weight: 700 !important; padding: 7px 6px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: 9px 6px !important; font-size: 9pt !important; color: #0f172a; box-sizing: border-box; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
    .footer { margin-top: 10px; font-size: 8pt; color: #64748b; text-align: right; font-weight: 600; page-break-inside: avoid; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${tablesHtml || '<p style="text-align:center;color:#666;">രജിസ്ട്രേഷൻ വിവരങ്ങളൊന്നും ലഭ്യമല്ല.</p>'}
  <div class="footer">മൊത്തം ഇടവകകൾ: ${totalParishes} | ആകെ മത്സരാർത്ഥികൾ: ${totalMembers} പേർ</div>
</body>
</html>`;


      const dynamicFilename = buildExportFilename('Group_Result_Sheet', { item: groupPrintItem });
    executePrintOrPdf(htmlContent, dynamicFilename, false, action);
  };

  // Group 4: Print Group Lot Sheet & WhatsApp Delivery
  const handlePrintGroupLotSheet = (action = 'print') => {
    const itemLabel = groupPrintItem === 'all' ? 'എല്ലാ ഗ്രൂപ്പ് ഇനങ്ങളും (All Group Items)' : (ITEM_NAMES_MAP[groupPrintItem] || groupPrintItem);
    const parishLabel = groupPrintParish === 'all' ? 'എല്ലാ ഇടവകകളും (All Parishes)' : groupPrintParish;

    let totalParishes = 0;
    let totalMembers = 0;
    groupPrintData.forEach(g => {
      totalParishes += g.parishes.length;
      g.parishes.forEach(p => { totalMembers += p.members.length; });
    });

    const tablesHtml = groupPrintData.map(group => {
      const rows = group.parishes.map((pGroup, idx) => `
        <tr>
          <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
          <td style="font-weight:bold;font-size:0.95rem;border:1px solid #334155;">${pGroup.parish}</td>
          <td style="text-align:center;border:1px solid #334155;">${pGroup.members.length} അംഗങ്ങൾ</td>
          <td style="text-align:center;font-size:1.15rem;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${pGroup.chestNumber || '-'}</td>
          <td style="border:1px solid #334155;"></td>
        </tr>`).join('');

      return `
        <table class="print-table" style="width:100%;border-collapse:collapse;margin-bottom:24px;page-break-inside:auto;">
          <thead>
            <tr>
              <th colspan="5" class="header-container">
                <div class="title-banner">
                  <h1>ചെറുപുഷ്പ മിഷൻ ലീഗ് &mdash; ${currentYear}</h1>
                  <p class="sub-title">
                    ഗ്രൂപ്പ് മത്സരങ്ങൾ &bull; <span class="sheet-badge">LOT SHEET (${group.itemName})</span>
                  </p>
                </div>
                <div class="meta-card">
                  <div class="meta-box-left">
                    <div>
                      <div class="meta-label">ഗ്രൂപ്പ് ഇനം (Group Event)</div>
                      <div class="meta-value highlight-item">${group.itemName}</div>
                    </div>
                  </div>
                  <div class="meta-box-right">
                    <div>
                      <div class="meta-label">ഇടവക / യൂണിറ്റ്</div>
                      <div class="meta-value">${parishLabel}</div>
                    </div>
                    <div style="display:flex;gap:8px;">
                      <div style="flex:1;text-align:center;background:#eff6ff;border:1.5px solid #bfdbfe;border-radius:6px;padding:3px 6px;">
                        <span style="font-size:7.5pt;font-weight:700;color:#1e40af;display:block;">ഇടവകകൾ</span>
                        <strong style="font-size:10pt;color:#1e3a8a;">${group.parishes.length} ഇടവകകൾ</strong>
                      </div>
                      <div style="flex:1;text-align:center;background:#f0fdf4;border:1.5px solid #bbf7d0;border-radius:6px;padding:3px 6px;">
                        <span style="font-size:7.5pt;font-weight:700;color:#166534;display:block;">ആകെ അംഗങ്ങൾ</span>
                        <strong style="font-size:10pt;color:#15803d;">${totalMembers} പേർ</strong>
                      </div>
                    </div>
                  </div>
                </div>
              </th>
            </tr>
            <tr class="col-header">
              <th style="width:50px;">Sl. No.</th>
              <th style="text-align:left;">ഇടവക (Parish)</th>
              <th style="width:130px;text-align:center;">അംഗങ്ങൾ</th>
              <th style="width:100px;text-align:center;">ചെസ്റ്റ് നം.</th>
              <th style="width:110px;text-align:center;">ചാൻസ് നം.</th>
            </tr>
          </thead>
          <tbody>${rows}</tbody>
        </table>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml">
<head>
  <meta charset="UTF-8">
  <title>Group Lot Sheet — ${itemLabel}</title>
  <style>
    @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;500;600;700;800&family=Inter:wght@400;500;600;700&display=swap');
    @page { size: A4 portrait; margin: 10mm 12mm 10mm 12mm; }
    * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Segoe UI', 'Inter', Arial, sans-serif; }
    body { margin: 0; padding: 0; color: #0f172a; background: #ffffff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
    table.print-table { width: 100%; border-collapse: collapse; page-break-inside: auto; }
    thead { display: table-header-group; }
    tfoot { display: table-footer-group; }
    tr { page-break-inside: avoid !important; break-inside: avoid !important; }
    .header-container { border: none !important; padding: 0 0 10px 0 !important; text-align: left; background: transparent !important; color: #0f172a !important; }
    .title-banner { text-align: center; margin-bottom: 10px; border-bottom: 2px solid #1e3a8a; padding-bottom: 8px; }
    .title-banner h1 { font-size: 15pt; margin: 0 0 3px 0; color: #1e3a8a; font-weight: 800; }
    .title-banner .sub-title { font-size: 10pt; font-weight: 600; color: #334155; margin: 0; }
    .title-banner .sheet-badge { display: inline-block; background: #1e3a8a; color: #ffffff; padding: 2px 10px; border-radius: 4px; font-size: 9pt; font-weight: 700; margin-left: 6px; }
    .meta-card { display: grid; grid-template-columns: 1.15fr 0.85fr; gap: 10px; background: #f8fafc; border: 1.5px solid #cbd5e1; border-radius: 6px; padding: 9px 12px; margin-bottom: 10px; }
    .meta-box-left { border-right: 1.5px solid #e2e8f0; padding-right: 10px; display: flex; flex-direction: column; gap: 4px; }
    .meta-box-right { padding-left: 4px; display: flex; flex-direction: column; justify-content: space-between; gap: 4px; }
    .meta-label { font-size: 7.5pt; font-weight: 600; color: #64748b; text-transform: uppercase; margin-bottom: 1px; }
    .meta-value { font-size: 9.5pt; font-weight: 700; color: #0f172a; }
    .meta-value.highlight-item { font-size: 10.5pt; color: #1e3a8a; }
    .col-header th { background: #1e3a8a !important; color: #ffffff !important; font-size: 8.8pt !important; font-weight: 700 !important; padding: 7px 8px !important; border: 1.5px solid #0f172a !important; text-align: center; }
    tbody td { border: 1px solid #334155 !important; padding: 9px 8px !important; font-size: 9pt !important; color: #0f172a; box-sizing: border-box; }
    tbody tr:nth-child(even) { background: #f8fafc !important; }
    .footer { margin-top: 10px; font-size: 8pt; color: #64748b; text-align: right; font-weight: 600; page-break-inside: avoid; }
    @media print { body { padding: 0; } }
  </style>
</head>
<body>
  ${tablesHtml || '<p style="text-align:center;color:#666;">രജിസ്ട്രേഷൻ വിവരങ്ങളൊന്നും ലഭ്യമല്ല.</p>'}
  <div class="footer">മൊത്തം ഇടവകകൾ: ${totalParishes} | ആകെ മത്സരാർത്ഥികൾ: ${totalMembers} പേർ</div>
</body>
</html>`;


      const dynamicFilename = buildExportFilename('Group_Lot_Sheet', { item: groupPrintItem, parish: groupPrintParish });
    executePrintOrPdf(htmlContent, dynamicFilename, false, action);
  };

  // Helper to calculate total points for a given competition result
  const calculateResultPoints = (res) => {
    if (!res) return 0;
    let pts = 0;
    const isGroup = res.itemType === 'group';
    const pos = parseInt(res.position);

    if (!isGroup) {
      if (pos === 1) pts += 5;
      else if (pos === 2) pts += 3;
      else if (pos === 3) pts += 1;

      if (res.grade === 'A') pts += 5;
      else if (res.grade === 'B') pts += 3;
      else if (res.grade === 'C') pts += 1;
    } else {
      if (pos === 1) pts += 10;
      else if (pos === 2) pts += 5;
      else if (pos === 3) pts += 3;

      if (res.grade === 'A') pts += 5;
      else if (res.grade === 'B') pts += 3;
      else if (res.grade === 'C') pts += 1;
    }
    return pts;
  };

  // Master Filtered & Custom-Sorted Results calculation (View & Print Results)
  const filteredResultsMaster = useMemo(() => {
    const list = results.filter(r => {
      const p = participants.find(part => part.id === r.participantId);
      const ageGroup = r.ageCategory || (p ? calculateAgeGroup(p.dob) : null);
      const gender = r.gender || (p ? p.gender : null);

      // 1. Category Mode Switcher
      if (resModalCategoryMode === 'sahithya' && r.category !== 'sahithya' && !r.itemName.startsWith('s_')) return false;
      if (resModalCategoryMode === 'kalaa' && r.category !== 'kalaa' && !r.itemName.startsWith('k_')) return false;

      // Filter Mode: Multi vs Simple
      if (resFilterMode === 'multi') {
        // Multi-Select Parish
        if (resSelectedParishes.length > 0 && !resSelectedParishes.includes(r.parish)) return false;

        // Multi-Select Age Category
        if (resSelectedCategories.length > 0 && ageGroup && !resSelectedCategories.includes(ageGroup)) return false;

        // Multi-Select Item
        if (resSelectedItems.length > 0 && !resSelectedItems.includes(r.itemName)) return false;

        // Multi-Select Gender
        if (resSelectedGenders.length > 0 && gender && !resSelectedGenders.includes(gender)) return false;
      } else {
        // 2. Item Filter
        if (resItemFilter && r.itemName !== resItemFilter) return false;

        // 3. Parish Filter
        if (resParishFilter && r.parish !== resParishFilter) return false;

        // 4. Age Category Filter
        if (resCategoryFilter && ageGroup && ageGroup !== resCategoryFilter) return false;

        // 5. Gender Filter
        if (resGenderFilter && resGenderFilter !== 'all' && gender && gender !== resGenderFilter) return false;
      }

      return true;
    });

    const AGE_CATEGORY_ORDER = {
      elders: 1,
      super_senior: 2,
      senior: 3,
      junior: 4,
      sub_junior: 5
    };
    const itemKeys = Object.keys(ITEM_NAMES_MAP);

    list.sort((a, b) => {
      const pA = participants.find(part => part.id === a.participantId);
      const pB = participants.find(part => part.id === b.participantId);

      // 1. Item dropdown order
      const itemIdxA = itemKeys.indexOf(a.itemName);
      const itemIdxB = itemKeys.indexOf(b.itemName);
      const validItemIdxA = itemIdxA !== -1 ? itemIdxA : 999;
      const validItemIdxB = itemIdxB !== -1 ? itemIdxB : 999;

      if (validItemIdxA !== validItemIdxB) {
        return validItemIdxA - validItemIdxB;
      }

      // 2. Gender: Male (1) -> Female (2) -> Group/Other (3)
      const genderA = a.gender || (pA ? pA.gender : null);
      const genderB = b.gender || (pB ? pB.gender : null);
      const genderRankA = genderA === 'male' ? 1 : (genderA === 'female' ? 2 : 3);
      const genderRankB = genderB === 'male' ? 1 : (genderB === 'female' ? 2 : 3);

      if (genderRankA !== genderRankB) {
        return genderRankA - genderRankB;
      }

      // 3. Age Category: Elders (1) -> Super Senior (2) -> Senior (3) -> Junior (4) -> Sub-Junior (5)
      const catA = a.ageCategory || (pA ? calculateAgeGroup(pA.dob) : null);
      const catB = b.ageCategory || (pB ? calculateAgeGroup(pB.dob) : null);
      const catRankA = catA && AGE_CATEGORY_ORDER[catA] ? AGE_CATEGORY_ORDER[catA] : 99;
      const catRankB = catB && AGE_CATEGORY_ORDER[catB] ? AGE_CATEGORY_ORDER[catB] : 99;

      if (catRankA !== catRankB) {
        return catRankA - catRankB;
      }

      // 4. Position / Place / Grade rank:
      // 1st place (1) -> 2nd place (2) -> 3rd place (3) -> Grade A (4) -> Grade B (5) -> Grade C (6) -> other (7)
      const getPosOrGradeRank = (res) => {
        const pos = parseInt(res.position);
        if (pos === 1) return 1;
        if (pos === 2) return 2;
        if (pos === 3) return 3;
        if (res.grade === 'A') return 4;
        if (res.grade === 'B') return 5;
        if (res.grade === 'C') return 6;
        return 7;
      };

      const rankA = getPosOrGradeRank(a);
      const rankB = getPosOrGradeRank(b);

      if (rankA !== rankB) {
        return rankA - rankB;
      }

      // 5. Secondary Grade tie-breaker within same position
      const getGradeRank = (grade) => {
        if (grade === 'A') return 1;
        if (grade === 'B') return 2;
        if (grade === 'C') return 3;
        return 4;
      };
      const gRankA = getGradeRank(a.grade);
      const gRankB = getGradeRank(b.grade);
      if (gRankA !== gRankB) {
        return gRankA - gRankB;
      }

      // 6. Parish tie-breaker
      return (a.parish || '').localeCompare(b.parish || '');
    });

    return list;
  }, [results, participants, resModalCategoryMode, resFilterMode, resItemFilter, resParishFilter, resCategoryFilter, resGenderFilter, resSelectedParishes, resSelectedCategories, resSelectedItems, resSelectedGenders, ageCategoryRules]);

  // Total selected points for currently filtered results
  const totalSelectedPoints = useMemo(() => {
    return filteredResultsMaster.reduce((sum, r) => sum + calculateResultPoints(r), 0);
  }, [filteredResultsMaster]);

  // Filtered & Sorted Results for Dedicated Edit Results Modal in Enter Winners
  const filteredEditResultsModalList = useMemo(() => {
    let list = results.filter(r => {
      const p = participants.find(part => part.id === r.participantId);

      // Search text match (Name, House Name, Chest Number, Parish)
      if (editResSearch && editResSearch.trim() !== '') {
        const query = editResSearch.toLowerCase().trim();
        const pNameMatch = p ? (p.name || '').toLowerCase().includes(query) : false;
        const pHouseMatch = p ? (p.houseName || '').toLowerCase().includes(query) : false;
        const chestMatch = (r.chestNumber || (p ? p.chestNumber : '') || '').includes(query);
        const parishMatch = (r.parish || '').toLowerCase().includes(query);
        const itemMatch = getItemDisplayName(r.itemName).toLowerCase().includes(query);

        if (!pNameMatch && !pHouseMatch && !chestMatch && !parishMatch && !itemMatch) {
          return false;
        }
      }

      // 1. Category Type Filter
      if (editResCatTypeFilter === 'sahithya' && r.category !== 'sahithya' && !r.itemName.startsWith('s_')) return false;
      if (editResCatTypeFilter === 'kalaa' && r.category !== 'kalaa' && !r.itemName.startsWith('k_')) return false;

      // 2. Item Filter
      if (editResItemFilter && r.itemName !== editResItemFilter) return false;

      // 3. Parish Filter
      if (editResParishFilter && r.parish !== editResParishFilter) return false;

      // 4. Age Category Filter
      if (editResAgeFilter) {
        const ageGroup = r.ageCategory || (p ? calculateAgeGroup(p.dob) : null);
        if (ageGroup && ageGroup !== editResAgeFilter) return false;
      }

      // 5. Gender Filter
      if (editResGenderFilter && editResGenderFilter !== 'all') {
        const gender = r.gender || (p ? p.gender : null);
        if (gender && gender !== editResGenderFilter) return false;
      }

      return true;
    });

    // Sorting
    list.sort((a, b) => {
      if (editResSortBy === 'position') {
        const posA = parseInt(a.position) || 99;
        const posB = parseInt(b.position) || 99;
        return posA - posB;
      } else if (editResSortBy === 'item') {
        return getItemDisplayName(a.itemName).localeCompare(getItemDisplayName(b.itemName));
      } else if (editResSortBy === 'parish') {
        return a.parish.localeCompare(b.parish);
      } else if (editResSortBy === 'name') {
        const pA = participants.find(p => p.id === a.participantId);
        const pB = participants.find(p => p.id === b.participantId);
        const nameA = pA ? pA.name : 'Group Team';
        const nameB = pB ? pB.name : 'Group Team';
        return nameA.localeCompare(nameB);
      }
      return 0;
    });

    return list;
  }, [results, participants, editResSearch, editResCatTypeFilter, editResItemFilter, editResParishFilter, editResAgeFilter, editResGenderFilter, editResSortBy, ageCategoryRules]);

  // Live Conflict Warning Map (re-calculated automatically whenever participants or DOB rules change)
  const conflictWarningMap = useMemo(() => {
    const map = {};
    if (!participants || participants.length === 0) return map;

    // Track parish + category + gender + item participant lists
    const parishItemPartsMap = {};

    participants.forEach(p => {
      const cat = calculateAgeGroup(p.dob);
      const parishKey = (p.parish || '').trim().toLowerCase();
      const genderKey = (p.gender || '').trim().toLowerCase();
      (p.registeredItems || []).forEach(itemId => {
        const key = `${parishKey}_${cat}_${genderKey}_${itemId}`;
        if (!parishItemPartsMap[key]) parishItemPartsMap[key] = [];
        parishItemPartsMap[key].push(p);
      });
    });

    participants.forEach(p => {
      const cat = calculateAgeGroup(p.dob);
      const catName = AGE_GROUPS[cat] || cat;
      const parishKey = (p.parish || '').trim().toLowerCase();
      const genderKey = (p.gender || '').trim().toLowerCase();
      const pViolations = [];

      // 1. Candidate Individual Sahithya / Kalaa Item Count Limit
      const sahItems = (p.registeredItems || []).filter(id => id.startsWith('s_'));
      const kalItems = (p.registeredItems || []).filter(id => id.startsWith('k_'));

      if (sahItems.length > 2) {
        pViolations.push({
          title: `സാഹിത്യ മത്സരങ്ങളുടെ പരിധി കവിഞ്ഞു (${catName})`,
          detail: `${catName} വിഭാഗത്തിൽ ${p.name} എന്ന മത്സരാർത്ഥി 2-ൽ കൂടുതൽ (${sahItems.length}) സാഹിത്യ മത്സരങ്ങളിൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. (രജിസ്റ്റർ ചെയ്ത ഇനങ്ങൾ: ${sahItems.map(getItemDisplayName).join(', ')}).`,
          otherParts: []
        });
      }
      if (kalItems.length > 2) {
        pViolations.push({
          title: `കലാ മത്സരങ്ങളുടെ പരിധി കവിഞ്ഞു (${catName})`,
          detail: `${catName} വിഭാഗത്തിൽ ${p.name} എന്ന മത്സരാർത്ഥി 2-ൽ കൂടുതൽ (${kalItems.length}) കലാ മത്സരങ്ങളിൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. (രജിസ്റ്റർ ചെയ്ത ഇനങ്ങൾ: ${kalItems.map(getItemDisplayName).join(', ')}).`,
          otherParts: []
        });
      }

      // 2. Katha Prasangam Rule (Sub-Junior, Junior, Senior only; Max 1 per parish)
      if ((p.registeredItems || []).includes('k_kadhaprasangam')) {
        if (!['sub_junior', 'junior', 'senior'].includes(cat)) {
          pViolations.push({
            title: `കഥാപ്രസംഗം മത്സര വിഭാഗം അസാധുവാണ്`,
            detail: `കഥാപ്രസംഗം മത്സരം സബ്‌ജൂനിയർ, ജൂനിയർ, സീനിയർ വിഭാഗങ്ങൾക്ക് മാത്രമുള്ളതാണ് (${p.name} ന്റെ വിഭാഗം: ${catName}).`,
            otherParts: []
          });
        }
        const kpKey = `${parishKey}_${cat}_k_kadhaprasangam`;
        const currentKpList = parishItemPartsMap[kpKey] || [];
        if (currentKpList.length > 1) {
          pViolations.push({
            title: `കഥാപ്രസംഗം - ഇടവക കോട്ട പരിധി കവിഞ്ഞു (${catName})`,
            detail: `${p.parish} ഇടവകയിൽ നിന്നും ${catName} വിഭാഗത്തിലെ കഥാപ്രസംഗം ഇനത്തിൽ ഈ മത്സരാർത്ഥി (${p.name}) ഉൾപ്പെടെ ആകെ ${currentKpList.length} പേർ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (പരമാവധി അനുവദനീയമായത്: 1 പേര് മാത്രം).`,
            otherParts: currentKpList
          });
        }
      }

      // 2. Folk Dance Rule (Sub-Junior and Junior girls only)
      if ((p.registeredItems || []).includes('k_dance')) {
        if (p.gender !== 'female' || !['sub_junior', 'junior'].includes(cat)) {
          pViolations.push({
            title: `നാടോടി നൃത്തം മത്സര വിഭാഗം/ജെൻഡർ അസാധുവാണ്`,
            detail: `നാടോടി നൃത്തം മത്സരം സബ്‌ജൂനിയർ, ജൂനിയർ വിഭാഗങ്ങളിലെ പെൺകുട്ടികൾക്ക് മാത്രമുള്ളതാണ് (${p.name}: ${p.gender === 'male' ? 'ആൺകുട്ടി' : 'പെൺകുട്ടി'}, ${catName}).`,
            otherParts: []
          });
        }
      }

      // 3. Parish Quota Limits for Individual Items (max 2 per parish per category per gender)
      (p.registeredItems || []).forEach(itemId => {
        if (itemId !== 'k_kadhaprasangam') {
          const key = `${parishKey}_${cat}_${genderKey}_${itemId}`;
          const currentList = parishItemPartsMap[key] || [];
          if (currentList.length > 2) {
            const itemName = getItemDisplayName(itemId);
            const genderText = p.gender === 'male' ? 'ആൺകുട്ടികൾ' : 'പെൺകുട്ടികൾ';
            pViolations.push({
              title: `${itemName} - ഇടവക കോട്ട പരിധി കവിഞ്ഞു (${catName})`,
              detail: `${p.parish} ഇടവകയിൽ നിന്നും ${catName} വിഭാഗത്തിലെ ${itemName} ഇനത്തിൽ (${genderText}) ഈ മത്സരാർത്ഥി (${p.name}) ഉൾപ്പെടെ ആകെ ${currentList.length} പേർ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (പരമാവധി അനുവദനീയമായത്: 2 പേര്).`,
              otherParts: currentList
            });
          }
        }
      });

      if (pViolations.length > 0) {
        map[p.id] = pViolations;
      }
    });

    return map;
  }, [participants, ageCategoryRules]);

  const filteredParticipants = useMemo(() => {
    return participants.filter(p => {
      const matchSearch = !partSearch || 
        p.name.toLowerCase().includes(partSearch.toLowerCase()) ||
        p.houseName.toLowerCase().includes(partSearch.toLowerCase()) ||
        (p.chestNumber && p.chestNumber.includes(partSearch)) ||
        (p.registerSlNo && p.registerSlNo.toLowerCase().includes(partSearch.toLowerCase())) ||
        (p.membershipNo && p.membershipNo.includes(partSearch));
      
      let matchParish = true;
      let matchGender = true;
      let matchCategory = true;
      let matchItem = true;

      if (partFilterMode === 'multi') {
        if (partSelectedParishes.length > 0) {
          matchParish = partSelectedParishes.includes(p.parish);
        }
        if (partSelectedGenders.length > 0) {
          matchGender = partSelectedGenders.includes(p.gender);
        }
        if (partSelectedCategories.length > 0) {
          matchCategory = partSelectedCategories.includes(calculateAgeGroup(p.dob));
        }
        if (partSelectedItems.length > 0) {
          matchItem = partSelectedItems.some(id => 
            p.registeredItems.includes(id) || (p.registeredGroupItems || []).includes(id)
          );
        }
      } else {
        matchParish = !partParishFilter || p.parish === partParishFilter;
        matchGender = !partGenderFilter || p.gender === partGenderFilter;
        matchCategory = !partCategoryFilter || calculateAgeGroup(p.dob) === partCategoryFilter;
        matchItem = !partItemFilter || p.registeredItems.includes(partItemFilter) || (p.registeredGroupItems || []).includes(partItemFilter);
      }
      
      const matchesCategoryMode = partModalCategoryMode === 'both' || 
        (partModalCategoryMode === 'sahithya' && p.registeredItems.some(id => id.startsWith('s_'))) ||
        (partModalCategoryMode === 'kalaa' && (p.registeredItems.some(id => id.startsWith('k_')) || (p.registeredGroupItems || []).length > 0));

      return matchSearch && matchParish && matchGender && matchCategory && matchesCategoryMode && matchItem;
    });
  }, [participants, partSearch, partParishFilter, partGenderFilter, partCategoryFilter, partItemFilter, partFilterMode, partSelectedParishes, partSelectedCategories, partSelectedGenders, partSelectedItems, partModalCategoryMode]);

  // Available Competition Items for Participants Roster Modal Dropdown based on partModalCategoryMode
  const itemsForPartModalDropdown = useMemo(() => {
    return Object.entries(ITEM_NAMES_MAP)
      .filter(([id]) => {
        if (partModalCategoryMode === 'sahithya') return id.startsWith('s_');
        if (partModalCategoryMode === 'kalaa') return id.startsWith('k_');
        return true;
      })
      .map(([id, name]) => ({ id, name }));
  }, [partModalCategoryMode]);

  // Helper to extract display items scoped strictly by competition category mode and item filter
  const getDisplayItemsForParticipant = (p) => {
    let indItems = p.registeredItems || [];
    let grpItems = p.registeredGroupItems || [];

    if (partModalCategoryMode === 'sahithya') {
      indItems = indItems.filter(id => id.startsWith('s_'));
      grpItems = [];
    } else if (partModalCategoryMode === 'kalaa') {
      indItems = indItems.filter(id => id.startsWith('k_'));
    }

    if (partFilterMode === 'multi' && partSelectedItems.length > 0) {
      indItems = indItems.filter(id => partSelectedItems.includes(id));
      grpItems = grpItems.filter(id => partSelectedItems.includes(id));
    } else if (partFilterMode === 'simple' && partItemFilter) {
      indItems = indItems.filter(id => id === partItemFilter);
      grpItems = grpItems.filter(id => id === partItemFilter);
    }

    return { indItems, grpItems };
  };

  // Master ID List
  const masterIdParticipantsList = useMemo(() => {
    let list = [...participants];

    list = list.filter(p => {
      const matchParish = !masterIdParishFilter || p.parish === masterIdParishFilter;
      const matchCat = !masterIdCatFilter || calculateAgeGroup(p.dob) === masterIdCatFilter;
      const matchGender = !masterIdGenderFilter || p.gender === masterIdGenderFilter;
      return matchParish && matchCat && matchGender;
    });

    list.sort((a, b) => {
      if (masterIdSortBy === 'name') return a.name.localeCompare(b.name);
      if (masterIdSortBy === 'parish') return a.parish.localeCompare(b.parish);
      return (a.masterId || '').localeCompare(b.masterId || '');
    });

    return list;
  }, [participants, masterIdParishFilter, masterIdCatFilter, masterIdGenderFilter, masterIdSortBy]);

  // Quota Enforcer in handleItemSelect
  const handleItemSelect = (itemId, cat, type) => {
    if (type === 'group') {
      const isGroupChecked = (partForm.registeredGroupItems || []).includes(itemId);
      let updatedGroupItems = [...(partForm.registeredGroupItems || [])];

      if (isGroupChecked) {
        updatedGroupItems = updatedGroupItems.filter(id => id !== itemId);
        setPartForm({ ...partForm, registeredGroupItems: updatedGroupItems });
      } else {
        let itemSize = 10;
        if (itemId === 'k_parichamuttu') itemSize = 8;
        else if (itemId === 'k_margamkali') itemSize = 7;
        else if (itemId === 'k_bible_drisya') itemSize = 5;
        else if (itemId === 'k_mission_anthem' || itemId === 'k_group_song') itemSize = 7;

        const parishGroupCount = participants.filter(p => 
          p.id !== partForm.id &&
          p.parish === partForm.parish &&
          p.registeredGroupItems &&
          p.registeredGroupItems.includes(itemId)
        ).length;

        if (parishGroupCount >= itemSize) {
          setWarningModal({
            show: true,
            message: `ഈ ഗ്രൂപ്പ് ഇനത്തിൽ (${getItemDisplayName(itemId)}) നിങ്ങളുടെ ഇടവകയിൽ നിന്നും പരമാവധി ടീം ശേഷി (${itemSize} പേർ) രജിസ്റ്റർ ചെയ്തു കഴിഞ്ഞു!`,
            items: []
          });
          return;
        }

        updatedGroupItems.push(itemId);
        setPartForm({ ...partForm, registeredGroupItems: updatedGroupItems });
      }
      return;
    }

    const isChecked = partForm.registeredItems.includes(itemId);
    let updatedItems = [...partForm.registeredItems];

    if (isChecked) {
      updatedItems = updatedItems.filter(id => id !== itemId);
      setPartForm({ ...partForm, registeredItems: updatedItems });
    } else {
      const ageGroup = calculateAgeGroup(partForm.dob);

      if (itemId === 's_essay' || itemId === 's_story' || itemId === 's_poetry' || itemId === 'k_elocution' || itemId === 'k_music' || itemId === 'k_quiz' || itemId === 'k_bible_reading') {
        const parishCount = participants.filter(p => 
          p.id !== partForm.id &&
          p.parish === partForm.parish &&
          p.gender === partForm.gender &&
          calculateAgeGroup(p.dob) === ageGroup &&
          p.registeredItems.includes(itemId)
        ).length;

        if (parishCount >= 2) {
          setWarningModal({
            show: true,
            message: `${getItemDisplayName(itemId)} ഇനത്തിൽ നിങ്ങളുടെ ഇടവകയിൽ നിന്നും ഈ വിഭാഗത്തിൽ പരമാവധി 2 (${partForm.gender === 'male' ? 'ആൺകുട്ടികൾ' : 'പെൺകുട്ടികൾ'}) രജിസ്റ്റർ ചെയ്തു കഴിഞ്ഞു!`,
            items: []
          });
          return;
        }
      } else if (itemId === 's_paint_water') {
        const parishCount = participants.filter(p => 
          p.id !== partForm.id &&
          p.parish === partForm.parish &&
          calculateAgeGroup(p.dob) === 'sub_junior' &&
          p.registeredItems.includes(itemId)
        ).length;

        if (parishCount >= 2) {
          setWarningModal({
            show: true,
            message: `${getItemDisplayName(itemId)} ഇനത്തിൽ സബ് ജൂനിയർ വിഭാഗത്തിൽ നിങ്ങളുടെ ഇടവകയിൽ നിന്നും പരമാവധി 2 പേർ രജിസ്റ്റർ ചെയ്തു കഴിഞ്ഞു!`,
            items: []
          });
          return;
        }
      } else if (itemId === 's_paint_pencil') {
        const parishCount = participants.filter(p => 
          p.id !== partForm.id &&
          p.parish === partForm.parish &&
          calculateAgeGroup(p.dob) === ageGroup &&
          p.registeredItems.includes(itemId)
        ).length;

        if (parishCount >= 2) {
          setWarningModal({
            show: true,
            message: `ചിത്രരചന പെൻസിൽ ഇനത്തിൽ നിങ്ങളുടെ ഇടവകയിൽ നിന്നും ഈ പ്രായ വിഭാഗത്തിൽ പരമാവധി 2 പേർ രജിസ്റ്റർ ചെയ്തു കഴിഞ്ഞു!`,
            items: []
          });
          return;
        }
      } else if (itemId === 'k_dance') {
        if (partForm.gender !== 'female' || (ageGroup !== 'sub_junior' && ageGroup !== 'junior')) {
          setWarningModal({
            show: true,
            message: `നാടോടി നൃത്തം മത്സരം സബ്‌ജൂനിയർ, ജൂനിയർ വിഭാഗങ്ങളിലെ പെൺകുട്ടികൾക്ക് മാത്രമുള്ളതാണ്!`,
            items: []
          });
          return;
        }

        const parishCount = participants.filter(p => 
          p.id !== partForm.id &&
          p.parish === partForm.parish &&
          p.gender === 'female' &&
          calculateAgeGroup(p.dob) === ageGroup &&
          p.registeredItems.includes(itemId)
        ).length;

        if (parishCount >= 2) {
          setWarningModal({
            show: true,
            message: `നാടോടി നൃത്തത്തിൽ ഈ വിഭാഗത്തിൽ (${AGE_GROUPS[ageGroup] || ageGroup}) നിങ്ങളുടെ ഇടവകയിൽ നിന്നും പരമാവധി 2 പെൺകുട്ടികൾ രജിസ്റ്റർ ചെയ്തു കഴിഞ്ഞു!`,
            items: []
          });
          return;
        }
      } else if (itemId === 'k_kadhaprasangam') {
        const parishCount = participants.filter(p => 
          p.id !== partForm.id &&
          p.parish === partForm.parish &&
          calculateAgeGroup(p.dob) === ageGroup &&
          p.registeredItems.includes(itemId)
        ).length;

        if (parishCount >= 1) {
          setWarningModal({
            show: true,
            message: `കഥാപ്രസംഗത്തിൽ ഈ പ്രായ വിഭാഗത്തിൽ (Sub Junior/Junior/Senior) നിങ്ങളുടെ ഇടവകയിൽ നിന്നും പരമാവധി 1 പേർക്ക് മാത്രമേ (ആൺ/പെൺ) പങ്കെടുക്കാൻ അനുവാദമുള്ളൂ!`,
            items: []
          });
          return;
        }
      }

      if (cat === 'sahithya') {
        const currentSahithyaCount = partForm.registeredItems.filter(id => id.startsWith('s_')).length;
        if (currentSahithyaCount >= 2) {
          setWarningModal({
            show: true,
            message: "സാഹിത്യ മത്സരത്തിൽ പരമാവധി 2 ഇനങ്ങളിൽ മാത്രമേ പങ്കെടുക്കാൻ സാധിക്കുകയുള്ളൂ!",
            items: []
          });
          return;
        }
      } else if (cat === 'kalaa') {
        const currentKalaaIndCount = partForm.registeredItems.filter(id => id.startsWith('k_')).length;
        if (currentKalaaIndCount >= 2) {
          setWarningModal({
            show: true,
            message: "കലാ മത്സരത്തിൽ പരമാവധി 2 വ്യക്തിഗത ഇനങ്ങളിൽ മാത്രമേ പങ്കെടുക്കാൻ സാധിക്കുകയുള്ളൂ!",
            items: []
          });
          return;
        }
      }

      updatedItems.push(itemId);
      setPartForm({ ...partForm, registeredItems: updatedItems });
    }
  };

  // Anti-Duplication Check on Save Participant
  const handleSaveParticipant = (e) => {
    e.preventDefault();
    if (!partForm.name || !partForm.houseName || !partForm.dob || !partForm.parish) {
      setWarningModal({
        show: true,
        message: "ദയവായി എല്ലാ പ്രധാന വിവരങ്ങളും (പേര്, വീട്ടുപേര്, ജനനത്തീയതി, ഇടവക) പൂരിപ്പിക്കുക!",
        items: []
      });
      return;
    }

    const totalItemsCount = (partForm.registeredItems || []).length + (partForm.registeredGroupItems || []).length;
    if (totalItemsCount === 0) {
      setWarningModal({
        show: true,
        message: "കുറഞ്ഞത് ഒരു മത്സര ഇനമെങ്കിലും (സാഹിത്യം അല്ലെങ്കിൽ കല) തിരഞ്ഞെടുക്കാതെ മത്സരാർത്ഥിയെ സേവ് ചെയ്യാൻ സാധിക്കില്ല! ദയവായി താഴെയുള്ള ലിസ്റ്റിൽ നിന്നും ഒരു മത്സര ഇനമെങ്കിലും തിരഞ്ഞെടുക്കുക.",
        items: []
      });
      return;
    }

    if (partForm.chestNumber && partForm.chestNumber.trim() !== '') {
      const trimmedChest = partForm.chestNumber.trim();
      const existing = participants.find(p => p.id !== partForm.id && p.chestNumber === trimmedChest);
      if (existing) {
        setWarningModal({
          show: true,
          message: `ചെസ്റ്റ് നമ്പർ (${trimmedChest}) ഇതിനകം ${existing.name} (${existing.parish}) എന്നവർക്ക് നൽകിയിട്ടുള്ളതാണ്! ഡൂപ്ലിക്കേറ്റ് ചെസ്റ്റ് നമ്പറുകൾ അനുവദനീയമല്ല.`,
          items: []
        });
        return;
      }
    }

    const ageGroup = calculateAgeGroup(partForm.dob);
    if (!ageGroup) {
      setWarningModal({
        show: true,
        message: "നൽകിയ ജനനത്തീയതി അനുസരിച്ച് പ്രായ വിഭാഗം നിർവ്വചിച്ചിട്ടില്ല! ദയവായി ശരിയായ ജനനത്തീയതി നൽകുക.",
        items: []
      });
      return;
    }

    executeSaveParticipant();
  };

  // Standalone Grade Calculator Handler
  const handleCalculateGrade = (e) => {
    if (e) e.preventDefault();
    const mark = parseFloat(calcMark);
    const max = parseFloat(calcMaxMark);
    if (isNaN(mark) || mark < 0) {
      showToast("സാധുവായ ഒരു മാർക്ക് നൽകുക!", "error");
      return;
    }
    if (mark > max) {
      showToast(`മാർക്ക് ${max}-ൽ കൂടാൻ പാടില്ല!`, "error");
      return;
    }

    const percentage = Math.round(((mark / max) * 100) * 100) / 100;

    let grade = "";
    let badgeColor = "";
    if (percentage >= 61) {
      grade = "A Grade";
      badgeColor = "#16a34a";
    } else if (percentage >= 51 && percentage <= 60.99) {
      grade = "B Grade";
      badgeColor = "#2563eb";
    } else if (percentage >= 40 && percentage <= 50.99) {
      grade = "C Grade";
      badgeColor = "#d97706";
    } else {
      grade = "No Grade (40% ന് താഴെ)";
      badgeColor = "#dc2626";
    }

    setCalcResult({
      mark,
      max,
      percentage,
      judgeCount: max === 200 ? 2 : 3,
      grade,
      badgeColor
    });
  };

  // Clean Database Reset Execution (Prevents native browser confirm lock)
  const handleConfirmResetDatabase = () => {
    const defaultDb = {
      dbVersion: "1.0.0_clean",
      settings: { currentYear: "2026" },
      years: {
        "2026": {
          activeCategory: "both",
          ageCategoryRules: JSON.parse(JSON.stringify(DEFAULT_DOB_RANGES)),
          participants: [],
          results: []
        }
      }
    };

    saveDb(defaultDb);
    setCurrentYear("2026");
    resetPartForm();
    setEditingPartId(null);
    setConfirmResetDbModal(false);
    showToast("ഡാറ്റാബേസ് വിജയകരമായി റീസെറ്റ് ചെയ്തു!", "success");

    setTimeout(() => {
      window.focus();
      if (document.activeElement && typeof document.activeElement.blur === 'function') {
        document.activeElement.blur();
      }
    }, 50);
  };

  const executeSaveParticipant = () => {
    const updatedDb = JSON.parse(JSON.stringify(db));
    const yearDataToEdit = updatedDb.years[currentYear];

    if (partForm.chestNumber && partForm.chestNumber.trim()) {
      const cTrim = partForm.chestNumber.trim();
      if (isChestNumberAlreadyUsed(cTrim, yearDataToEdit, null, null, editingPartId)) {
        showToast(`ചെസ്റ്റ് നമ്പർ "${cTrim}" ഇതിനകം മറ്റൊരു ഇനത്തിനോ മത്സരാർത്ഥിക്കോ നൽകിയിട്ടുണ്ട്!`, "error");
        return;
      }
    }

    if (editingPartId) {
      yearDataToEdit.participants = yearDataToEdit.participants.map(p => {
        if (p.id === editingPartId) {
          const updated = { 
            ...partForm, 
            masterId: p.masterId || ("PID-" + String(yearDataToEdit.participants.length + 1001)),
            chestNumber: partForm.chestNumber ? partForm.chestNumber.trim() : "" 
          };
          delete updated.hasConflictWarning;
          delete updated.conflictIssues;
          return updated;
        }
        return p;
      });
    } else {
      const newMasterId = "PID-" + String(yearDataToEdit.participants.length + 1001);
      const newPart = {
        ...partForm,
        id: "p_" + Date.now(),
        masterId: newMasterId,
        chestNumber: partForm.chestNumber ? partForm.chestNumber.trim() : ""
      };
      delete newPart.hasConflictWarning;
      delete newPart.conflictIssues;
      yearDataToEdit.participants.push(newPart);
    }

    saveDb(updatedDb);
    resetPartForm();
    showToast("മത്സരാർത്ഥിയുടെ വിവരങ്ങൾ വിജയകരമായി സേവ് ചെയ്തു!", "success");
  };

  const checkDuplicatePositionAssignment = (yrResults, yearParts, targetItemName, targetAgeCat, targetGender, targetPos, currentResultId = null) => {
    if (!targetPos || !targetPos.trim()) return null;
    const posNorm = targetPos.trim().toLowerCase().replace(/st|nd|rd|th/g, '');
    if (!['1', '2', '3'].includes(posNorm)) return null; // Only 1st, 2nd, 3rd positions are restricted

    const existingMatch = yrResults.find(r => {
      if (currentResultId && r.id === currentResultId) return false;
      if (r.itemName !== targetItemName) return false;

      let rAgeCat = r.ageCategory;
      let rGender = r.gender;
      if (r.participantId) {
        const p = yearParts.find(part => part.id === r.participantId);
        if (p) {
          if (!rAgeCat && p.dob) rAgeCat = calculateAgeGroup(p.dob);
          if (p.gender) rGender = p.gender;
        }
      }

      if (rAgeCat && targetAgeCat && rAgeCat !== targetAgeCat) return false;

      const isCommonItem = targetItemName === 's_paint_water' || targetItemName === 's_paint_pencil' || targetItemName === 'k_kadhaprasangam';

      const normRGender = (rGender === 'all' || !rGender) ? null : rGender;
      const normTargetGender = (targetGender === 'all' || !targetGender) ? null : targetGender;

      // For gender-separate individual items, position uniqueness is scoped per gender (Male 1st/2nd/3rd vs Female 1st/2nd/3rd)
      // For Common items and Group items, position uniqueness is COMBINED across all participants (only ONE 1st, ONE 2nd, ONE 3rd total)!
      if (!isCommonItem && r.itemType !== 'group' && normRGender && normTargetGender && normRGender !== normTargetGender) return false;

      const rPosNorm = (r.position || '').trim().toLowerCase().replace(/st|nd|rd|th/g, '');
      return rPosNorm === posNorm;
    });

    if (existingMatch) {
      const posLabel = posNorm === '1' ? '1-ാം' : posNorm === '2' ? '2-ാം' : '3-ാം';
      let holderInfo = '';
      if (existingMatch.participantId) {
        const p = yearParts.find(part => part.id === existingMatch.participantId);
        if (p) {
          holderInfo = `${p.name} (${p.parish}${p.chestNumber ? `, Chest #${p.chestNumber}` : ''})`;
        } else {
          holderInfo = `${existingMatch.parish || 'അറിയപ്പെടാത്ത'} ഇടവകയിലെ മത്സരാർത്ഥി`;
        }
      } else {
        holderInfo = `${existingMatch.parish || 'അറിയപ്പെടാത്ത'} ഇടവക (ഗ്രൂപ്പ് ടീം)`;
      }

      const itemNameDisplay = getItemDisplayName(targetItemName);
      const catNameDisplay = AGE_GROUPS[targetAgeCat] || targetAgeCat || '';
      const catPrefix = catNameDisplay ? ` (${catNameDisplay})` : '';

      return `${itemNameDisplay}${catPrefix} മത്സരത്തിൽ ${posLabel} സ്ഥാനം ഇതിനകം ${holderInfo} എന്നവർക്ക് നൽകിയിട്ടുള്ളതാണ്! ഒരു മത്സരത്തിൽ ഒരാൾക്ക് മാത്രമേ 1, 2, 3 സ്ഥാനങ്ങൾ നൽകാൻ സാധിക്കൂ.`;
    }

    return null;
  };



  const handleEditParticipant = (p) => {
    setPartForm({ ...p });
    setEditingPartId(p.id);
    setShowParticipantsModal(false);
    setShowChestManagementModal(false);
    setShowMasterIdModal(false);
    setShowMergeModal(false);
    setActiveTab("participants");
  };

  const handleDeleteParticipant = (pId) => {
    if (confirm("ഈ മത്സരാർത്ഥിയെ ഒഴിവാക്കാൻ നിങ്ങൾക്ക് ഉറപ്പാണോ?")) {
      const updatedDb = JSON.parse(JSON.stringify(db));
      const yr = updatedDb.years[currentYear];
      yr.participants = yr.participants.filter(p => p.id !== pId);
      yr.results = yr.results.filter(res => res.participantId !== pId);
      saveDb(updatedDb);
      showToast("ഒഴിവാക്കിയിരിക്കുന്നു!", "success");
    }
  };

  const resetPartForm = () => {
    setPartForm(prev => ({
      id: "",
      masterId: "",
      name: "",
      houseName: "",
      dob: "",
      membershipNo: "",
      registerSlNo: "",
      gender: "male",
      parish: prev?.parish || PARISHES[0],
      chestNumber: "",
      registeredItems: [],
      registeredGroupItems: []
    }));
    setEditingPartId(null);
    setNameSuggestions([]);
    setShowNameSuggestions(false);
  };

  // Inline Chest Number Edit (Individual)
  const handleSaveInlineChestNumber = (participantId, newChestNumber) => {
    const trimmed = String(newChestNumber || '').trim();
    const updatedDb = JSON.parse(JSON.stringify(db));
    const yr = updatedDb.years[currentYear];
    if (!yr) return;

    if (trimmed && isChestNumberAlreadyUsed(trimmed, yr, null, null, participantId)) {
      showToast(`ചെസ്റ്റ് നമ്പർ "${trimmed}" മറ്റൊരു മത്സരാർത്ഥിക്കോ ഗ്രൂപ്പിനോ ഇതിനകം നൽകിയിട്ടുണ്ട്!`, 'error');
      return;
    }

    yr.participants = (yr.participants || []).map(p =>
      p.id === participantId ? { ...p, chestNumber: trimmed } : p
    );
    yr.results = (yr.results || []).map(r =>
      r.participantId === participantId ? { ...r, chestNumber: trimmed } : r
    );

    saveDb(updatedDb);
    setEditingChestKey(null);
    setEditingChestValue('');
    showToast('ചെസ്റ്റ് നമ്പർ അപ്ഡേറ്റ് ചെയ്തു!', 'success');
  };

  // Inline Chest Number Edit (Group)
  const handleSaveInlineGroupChestNumber = (itemId, parish, newChestNumber) => {
    const trimmed = String(newChestNumber || '').trim();
    const updatedDb = JSON.parse(JSON.stringify(db));
    const yr = updatedDb.years[currentYear];
    if (!yr) return;

    if (trimmed && isChestNumberAlreadyUsed(trimmed, yr, itemId, parish, null)) {
      showToast(`ചെസ്റ്റ് നമ്പർ "${trimmed}" മറ്റൊരു മത്സരാർത്ഥിക്കോ ഗ്രൂപ്പിനോ ഇതിനകം നൽകിയിട്ടുണ്ട്!`, 'error');
      return;
    }

    if (!yr.groupChestNumbers) yr.groupChestNumbers = {};
    if (!yr.groupChestNumbers[itemId]) yr.groupChestNumbers[itemId] = {};

    if (trimmed) {
      yr.groupChestNumbers[itemId][parish] = trimmed;
    } else {
      delete yr.groupChestNumbers[itemId][parish];
    }

    yr.results = (yr.results || []).map(r =>
      r.itemType === 'group' && r.itemName === itemId && r.parish === parish
        ? { ...r, chestNumber: trimmed }
        : r
    );

    saveDb(updatedDb);
    setEditingChestKey(null);
    setEditingChestValue('');
    showToast('ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പർ അപ്ഡേറ്റ് ചെയ്തു!', 'success');
  };

  // Dedicated Print & PDF Generator for View & Print Results Modal
  const handlePrintMasterResults = (action = 'print') => {
    const isLandscape = Boolean(incRegSlNoInResultsPrint || incMemNoInResultsPrint);
    const parishLabel = resFilterMode === 'simple'
      ? (resParishFilter || 'എല്ലാ ഇടവകകളും (All Parishes)')
      : (resSelectedParishes.length === 0 ? 'എല്ലാ ഇടവകകളും (All)' : resSelectedParishes.join(', '));
    const categoryLabel = resFilterMode === 'simple'
      ? (resCategoryFilter ? (AGE_GROUPS[resCategoryFilter] || resCategoryFilter) : 'എല്ലാ വിഭാഗങ്ങളും (All)')
      : (resSelectedCategories.length === 0 ? 'എല്ലാ വിഭാഗങ്ങളും (All)' : resSelectedCategories.map(k => AGE_GROUPS[k] || k).join(', '));
    const itemLabel = resFilterMode === 'simple'
      ? (resItemFilter ? getItemDisplayName(resItemFilter) : 'എല്ലാ ഇനങ്ങളും (All)')
      : (resSelectedItems.length === 0 ? 'എല്ലാ ഇനങ്ങളും (All)' : resSelectedItems.map(id => getItemDisplayName(id)).join(', '));
    const genderLabel = resFilterMode === 'simple'
      ? (resGenderFilter === 'male' ? 'ആൺകുട്ടികൾ (Boys)' : resGenderFilter === 'female' ? 'പെൺകുട്ടികൾ (Girls)' : 'എല്ലാവരും (All)')
      : (resSelectedGenders.length === 0 ? 'എല്ലാവരും (All)' : resSelectedGenders.map(g => g === 'male' ? 'Boys' : 'Girls').join(', '));
    const catModeLabel = resModalCategoryMode === 'sahithya' ? 'സാഹിത്യ മത്സരം (Sahithya Only)' : resModalCategoryMode === 'kalaa' ? 'കലാമത്സരം (Kalaa Only)' : 'എല്ലാം (Sahithya & Kalaa)';

    const dynamicFilename = buildExportFilename('Results_Master', {
      mode: resModalCategoryMode,
      parish: resFilterMode === 'simple' ? resParishFilter : (resSelectedParishes.length === 1 ? resSelectedParishes[0] : ''),
      category: resFilterMode === 'simple' ? resCategoryFilter : (resSelectedCategories.length === 1 ? resSelectedCategories[0] : ''),
      gender: resFilterMode === 'simple' ? resGenderFilter : (resSelectedGenders.length === 1 ? resSelectedGenders[0] : ''),
      item: resFilterMode === 'simple' ? resItemFilter : (resSelectedItems.length === 1 ? resSelectedItems[0] : '')
    });
    const pageTitle = dynamicFilename.replace(/\.pdf$/i, '');
    const totalCols = 8 + (incRegSlNoInResultsPrint ? 1 : 0) + (incMemNoInResultsPrint ? 1 : 0) + (incChestNoInResultsPrint ? 1 : 0);

    const rows = filteredResultsMaster.map((r, idx) => {
      const p = participants.find(part => part.id === r.participantId);
      const isGroup = r.itemType === 'group' || !r.participantId;
      const ageKey = r.ageCategory || (p && p.dob ? calculateAgeGroup(p.dob) : null);
      const baseAge = ageKey ? (AGE_GROUPS_SHORT_ENG[ageKey] || ageKey) : '-';
      const gVal = r.gender || (p ? p.gender : null);
      const gLabel = gVal === 'male' ? 'Male' : gVal === 'female' ? 'Female' : (isGroup ? 'Group' : '');
      const ageText = isGroup ? '-' : (gLabel && baseAge !== '-' ? `${baseAge} (${gLabel})` : baseAge);
      const chestStr = r.chestNumber || (p ? p.chestNumber : '') || '-';
      const pts = calculateResultPoints(r);
      const regCell = incRegSlNoInResultsPrint ? `<td style="text-align:center;border:1px solid #334155;">${!isGroup && p?.registerSlNo ? p.registerSlNo : '-'}</td>` : '';
      const memCell = incMemNoInResultsPrint ? `<td style="text-align:center;border:1px solid #334155;">${!isGroup && p?.membershipNo ? p.membershipNo : '-'}</td>` : '';
      const chestCell = incChestNoInResultsPrint ? `<td style="text-align:center;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${chestStr}</td>` : '';
      const nameHtml = isGroup
        ? `<strong>ഗ്രൂപ്പ് ടീം (${r.parish})</strong>`
        : `<strong>${p ? p.name : (r.name || '-')}</strong>${p?.houseName ? `<div style="font-size:0.85em;color:#555;">${p.houseName}</div>` : ''}`;

      return `<tr>
        <td style="text-align:center;font-weight:700;border:1px solid #334155;">${idx + 1}</td>
        ${regCell}${memCell}${chestCell}
        <td style="border:1px solid #334155;font-weight:700;">${getItemDisplayName(r.itemName)}</td>
        <td style="text-align:center;border:1px solid #334155;">${ageText}</td>
        <td style="border:1px solid #334155;">${nameHtml}</td>
        <td style="border:1px solid #334155;">${r.parish || '-'}</td>
        <td style="text-align:center;font-weight:700;border:1px solid #334155;">${r.position || '-'}</td>
        <td style="text-align:center;font-weight:700;border:1px solid #334155;">${r.grade || '-'}</td>
        <td style="text-align:center;font-weight:800;color:#1e3a8a;border:1px solid #334155;">${pts > 0 ? pts : '-'}</td>
      </tr>`;
    }).join('');

    const htmlContent = `<!DOCTYPE html>
<html lang="ml"><head><meta charset="UTF-8" /><title>${pageTitle}</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Noto+Sans+Malayalam:wght@400;600;700;800&family=Inter:wght@400;600;700&display=swap');
  @page { size: ${isLandscape ? 'A4 landscape' : 'A4 portrait'}; margin: 8mm 10mm; }
  * { box-sizing: border-box; font-family: 'Noto Sans Malayalam', 'Inter', sans-serif; }
  body { margin: 0; color: #0f172a; background: #fff; -webkit-print-color-adjust: exact; print-color-adjust: exact; }
  table { width: 100%; border-collapse: collapse; font-size: 9pt; }
  thead { display: table-header-group; }
  tr { page-break-inside: avoid; }
  .col-header th { background: #1e3a8a; color: #fff; padding: 7px 5px; border: 1.5px solid #0f172a; }
  td { padding: 6px 5px; vertical-align: top; }
  tbody tr:nth-child(even) { background: #f8fafc; }
</style></head><body>
<table>
  <thead>
    <tr><th colspan="${totalCols}" style="text-align:center;padding-bottom:8px;border:none;border-bottom:2px solid #1e3a8a;">
      <h1 style="margin:0;font-size:15pt;color:#1e3a8a;">CML കലോത്സവം &amp; സാഹിത്യോത്സവം &mdash; ${currentYear}</h1>
      <div style="font-size:10pt;color:#334155;margin-top:2px;">RESULTS MASTER SHEET &bull; ${catModeLabel}</div>
      <div style="font-size:8.5pt;color:#475569;margin-top:4px;">ഇടവക: ${parishLabel} | വിഭാഗം: ${categoryLabel} | ഇനം: ${itemLabel} | ലിംഗം: ${genderLabel} | ആകെ ഫലങ്ങൾ: ${filteredResultsMaster.length} | ആകെ പോയിന്റ്: ${totalSelectedPoints}</div>
    </th></tr>
    <tr class="col-header">
      <th>Sl.</th>
      ${incRegSlNoInResultsPrint ? '<th>Reg. Sl. No</th>' : ''}
      ${incMemNoInResultsPrint ? '<th>Mem. No</th>' : ''}
      ${incChestNoInResultsPrint ? '<th>Chest No</th>' : ''}
      <th style="text-align:left;">ഇനം (Item)</th>
      <th>വിഭാഗം (Category)</th>
      <th style="text-align:left;">പേര് &amp; വീട്ടുപേര്</th>
      <th style="text-align:left;">ഇടവക (Parish)</th>
      <th>സ്ഥാനം</th>
      <th>ഗ്രേഡ്</th>
      <th>പോയിന്റ്</th>
    </tr>
  </thead>
  <tbody>${rows || `<tr><td colspan="${totalCols}" style="text-align:center;padding:12px;border:1px solid #334155;">ഫലങ്ങളൊന്നും ലഭ്യമല്ല.</td></tr>`}</tbody>
</table></body></html>`;
    executePrintOrPdf(htmlContent, dynamicFilename, isLandscape, action);
  };

  // Clear Chest Numbers Execution Logic
  const executeClearChestNumbers = () => {
    const updatedDb = JSON.parse(JSON.stringify(db));
    const yr = updatedDb.years[currentYear];
    if (!yr.groupChestNumbers) yr.groupChestNumbers = {};

    let clearedCount = 0;

    if (clearChestModal.mode === 'all') {
      yr.participants.forEach(p => {
        if (p.chestNumber) { p.chestNumber = ""; clearedCount++; }
      });
      yr.groupChestNumbers = {};
    } else if (clearChestModal.mode === 'category_ind') {
      yr.participants.forEach(p => {
        const matchCat = calculateAgeGroup(p.dob) === clearChestModal.category;
        const matchGen = clearChestModal.gender === 'all' || p.gender === clearChestModal.gender;
        const matchItem = !clearChestModal.itemId || p.registeredItems.includes(clearChestModal.itemId);

        if (matchCat && matchGen && matchItem && p.chestNumber) {
          p.chestNumber = "";
          clearedCount++;
        }
      });
    } else if (clearChestModal.mode === 'group_gender') {
      if (clearChestModal.itemId) {
        if (yr.groupChestNumbers[clearChestModal.itemId]) {
          clearedCount += Object.keys(yr.groupChestNumbers[clearChestModal.itemId]).length;
          delete yr.groupChestNumbers[clearChestModal.itemId];
        }
      } else {
        const targetItems = clearChestModal.gender === 'male' ? ['k_parichamuttu'] : clearChestModal.gender === 'female' ? ['k_margamkali'] : ['k_parichamuttu', 'k_margamkali'];
        targetItems.forEach(id => {
          if (yr.groupChestNumbers[id]) {
            clearedCount += Object.keys(yr.groupChestNumbers[id]).length;
            delete yr.groupChestNumbers[id];
          }
        });
      }
    } else if (clearChestModal.mode === 'group_common') {
      if (clearChestModal.itemId) {
        if (yr.groupChestNumbers[clearChestModal.itemId]) {
          clearedCount += Object.keys(yr.groupChestNumbers[clearChestModal.itemId]).length;
          delete yr.groupChestNumbers[clearChestModal.itemId];
        }
      } else {
        const commonItems = ['k_bible_drisya', 'k_mission_anthem', 'k_group_song'];
        commonItems.forEach(id => {
          if (yr.groupChestNumbers[id]) {
            clearedCount += Object.keys(yr.groupChestNumbers[id]).length;
            delete yr.groupChestNumbers[id];
          }
        });
      }
    } else if (clearChestModal.mode === 'participant') {
      yr.participants.forEach(p => {
        if (p.id === clearChestModal.participantId && p.chestNumber) {
          p.chestNumber = "";
          clearedCount++;
        }
      });
    }

    saveDb(updatedDb);
    setConfirmClearModal(false);
    setClearChestModal({ mode: 'all', category: 'sub_junior', gender: 'all', itemId: '', participantId: '' });
    showToast(`${clearedCount} ഇനങ്ങളുടെ ചെസ്റ്റ് നമ്പർ റദ്ദാക്കി!`, "success");
  };

  // Auto-Assign Chest Numbers Execution Logic
  const executeAutoAssignChestNumbers = () => {
    if (!autoChestModal.itemId) {
      showToast("മത്സര ഇനം തിരഞ്ഞെടുക്കുക!", "error");
      return;
    }

    const updatedDb = JSON.parse(JSON.stringify(db));
    const yr = updatedDb.years[currentYear];
    let startNum = parseInt(autoChestModal.startingNumber) || 101;

    if (autoChestTab === 'individual') {
      const candidates = yr.participants.filter(p => {
        const matchCat = calculateAgeGroup(p.dob) === autoChestModal.ageCategory;
        const matchGen = p.gender === autoChestModal.gender;
        const matchesItem = p.registeredItems.includes(autoChestModal.itemId);
        return matchCat && matchGen && matchesItem && !p.chestNumber;
      });

      if (candidates.length === 0) {
        showToast("ചെസ്റ്റ് നമ്പർ നൽകാനായി പുതിയ മത്സരാർത്ഥികളാരും ഇല്ല!", "error");
        return;
      }

      candidates.forEach(c => {
        while (isChestNumberAlreadyUsed(startNum, yr, null, null, c.id)) {
          startNum++;
        }
        const target = yr.participants.find(p => p.id === c.id);
        if (target) {
          target.chestNumber = String(startNum);
          startNum++;
        }
      });

      saveDb(updatedDb);
      setAutoChestModal({ ...autoChestModal, itemId: "" });
      showToast(`${candidates.length} പേർക്ക് വ്യക്തിഗത ചെസ്റ്റ് നമ്പർ വിജയകരമായി നൽകി!`, "success");
    } else {
      // Group Items Chest Number Assignment per Parish
      if (!yr.groupChestNumbers) yr.groupChestNumbers = {};
      if (!yr.groupChestNumbers[autoChestModal.itemId]) yr.groupChestNumbers[autoChestModal.itemId] = {};

      const participatingParishes = [];
      yr.participants.forEach(p => {
        if ((p.registeredGroupItems || []).includes(autoChestModal.itemId)) {
          if (!participatingParishes.includes(p.parish)) {
            participatingParishes.push(p.parish);
          }
        }
      });
      participatingParishes.sort((a, b) => a.localeCompare(b));

      const unassignedParishes = participatingParishes.filter(parish => !yr.groupChestNumbers[autoChestModal.itemId][parish]);

      if (unassignedParishes.length === 0) {
        showToast("ഈ ഗ്രൂപ്പ് ഇനത്തിൽ ചെസ്റ്റ് നമ്പർ നൽകാനായി പുതിയ ഇടവകകളൊന്നും ഇല്ല!", "error");
        return;
      }

      let assignedCount = 0;
      unassignedParishes.forEach(parish => {
        while (isChestNumberAlreadyUsed(startNum, yr, autoChestModal.itemId, parish)) {
          startNum++;
        }
        yr.groupChestNumbers[autoChestModal.itemId][parish] = String(startNum);
        startNum++;
        assignedCount++;
      });

      saveDb(updatedDb);
      setAutoChestModal({ ...autoChestModal, itemId: "" });
      showToast(`${assignedCount} ഇടവകകൾക്ക് ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പർ വിജയകരമായി നൽകി! (മറ്റു ഇനങ്ങളുമായി നമ്പർ കൂടിക്കലരില്ല)`, "success");
    }
  };

  // Save Winner Result Logic - Fully Synchronized & Clean Duplicate Prevention
  const handleSaveWinner = (e) => {
    e.preventDefault();

    const updatedDb = JSON.parse(JSON.stringify(db));
    const yr = updatedDb.years[currentYear];

    let targetPartId = "";
    let targetChest = "";
    let targetItemName = winnerForm.itemName;
    let targetParish = winnerForm.parish;
    let targetAgeCat = winnerForm.ageCategory;
    let targetGender = winnerForm.gender;

    if (winnerEntryType === 'individual') {
      if (winnerEntryMode === 'chest') {
        if (!winnerFoundPart) {
          showToast("സാധുവായ ചെസ്റ്റ് നമ്പർ തിരഞ്ഞു കണ്ടെത്തുക!", "error");
          return;
        }
        targetPartId = winnerFoundPart.id;
        targetChest = winnerFoundPart.chestNumber || "";
        targetParish = winnerFoundPart.parish;
        targetAgeCat = calculateAgeGroup(winnerFoundPart.dob) || winnerForm.ageCategory;
        targetGender = winnerFoundPart.gender;
        targetItemName = winnerForm.itemName;
      } else if (winnerEntryMode === 'select') {
        targetItemName = winSelItem;
        targetParish = winSelParish;
        targetAgeCat = winSelAge;
        targetGender = winSelGender;

        if (!winSelPartId) {
          showToast("ദയവായി മത്സരാർത്ഥിയെ തിരഞ്ഞെടുക്കുക!", "error");
          return;
        }
        targetPartId = winSelPartId;

        const p = participants.find(part => part.id === winSelPartId);
        if (p) {
          targetChest = p.chestNumber || "";
          if (p.dob) {
            const calculatedAge = calculateAgeGroup(p.dob);
            if (calculatedAge) targetAgeCat = calculatedAge;
          }
        }
      }
    }

    if (winnerEntryType === 'group') {
      if (winnerGroupEntryMode === 'chest') {
        if (!winnerFoundGroup) {
          showToast("സാധുവായ ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പർ നൽകുക!", "error");
          return;
        }
        targetItemName = winnerFoundGroup.itemId;
        targetParish = winnerFoundGroup.parish;
        targetChest = winnerFoundGroup.chestNumber || "";
      } else {
        targetItemName = winnerForm.itemName;
        targetParish = winnerForm.parish;
        targetChest = yr.groupChestNumbers?.[targetItemName]?.[targetParish] || "";
      }
    }

    if (!targetItemName) {
      showToast("ദയവായി മത്സര ഇനം തിരഞ്ഞെടുക്കുക!", "error");
      return;
    }

    if (winnerEntryType === 'group') {
      if (!targetParish) {
        showToast("ദയവായി ഈ ഇനത്തിൽ അംഗങ്ങൾ രജിസ്റ്റർ ചെയ്തിട്ടുള്ള ഒരു ഇടവക തിരഞ്ഞെടുക്കുക!", "error");
        return;
      }
      if (!registeredParishesForGroupItem.includes(targetParish) && winnerGroupEntryMode !== 'chest') {
        showToast("തിരഞ്ഞെടുത്ത ഇടവകയിൽ നിന്നും ഈ ഗ്രൂപ്പ് ഇനത്തിൽ ആരും രജിസ്റ്റർ ചെയ്തിട്ടില്ല!", "error");
        return;
      }
    } else {
      if (!targetParish) {
        showToast("ദയവായി ഇടവക തിരഞ്ഞെടുക്കുക!", "error");
        return;
      }
    }

    if (winnerEntryType === 'individual' && !targetPartId) {
      showToast("ദയവായി മത്സരാർത്ഥിയെ തിരഞ്ഞെടുക്കുക!", "error");
      return;
    }

    // Explicit Duplicate Checking with precise user-friendly error message
    if (winnerEntryType === 'individual' && targetPartId) {
      const duplicateExists = yr.results.some(r => 
        r.itemType === 'individual' && 
        r.participantId === targetPartId && 
        r.itemName === targetItemName
      );

      if (duplicateExists) {
        showToast("ഈ ഇനത്തിൽ ഈ മത്സരാർത്ഥിയുടെ ഫലം ഇതിനകം രേഖപ്പെടുത്തിയിട്ടുണ്ട്! (Result already added for this participant in this item)", "error");
        return;
      }
    }

    if (winnerEntryType === 'group' && targetParish) {
      const groupDuplicateExists = yr.results.some(r => 
        r.itemType === 'group' && 
        r.parish === targetParish && 
        r.itemName === targetItemName
      );

      if (groupDuplicateExists) {
        showToast("ഈ ഗ്രൂപ്പ് ഇനത്തിൽ ഈ ഇടവകയുടെ ഫലം ഇതിനകം രേഖപ്പെടുത്തിയിട്ടുണ്ട്!", "error");
        return;
      }
    }

    const posValid = winnerForm.position && winnerForm.position.trim() !== "";
    const gradeValid = winnerForm.grade && winnerForm.grade.trim() !== "";

    if (!posValid && !gradeValid) {
      showToast("സ്ഥാനമോ ഗ്രേഡോ ഇല്ലാത്ത ഫലം രേഖപ്പെടുത്താൻ കഴിയില്ല!", "error");
      return;
    }

    // Check duplicate 1st, 2nd, 3rd position restriction (scoped per gender for individual items)
    const dupPosMsg = checkDuplicatePositionAssignment(
      yr.results,
      yr.participants,
      targetItemName,
      targetAgeCat,
      targetGender,
      winnerForm.position
    );

    if (dupPosMsg) {
      showToast(dupPosMsg, "error");
      return;
    }

    const isSah = targetItemName.startsWith('s_');

    const newResult = {
      id: "res_" + Date.now(),
      declaredAt: Date.now(),
      category: isSah ? 'sahithya' : 'kalaa',
      itemType: winnerEntryType,
      itemName: targetItemName,
      ageCategory: targetAgeCat,
      gender: targetGender,
      parish: targetParish,
      participantId: targetPartId,
      chestNumber: targetChest,
      position: winnerForm.position || "",
      grade: winnerForm.grade || ""
    };

    yr.results.push(newResult);
    saveDb(updatedDb);
    showToast("വിജയിയുടെ വിവരങ്ങൾ രേഖപ്പെടുത്തി!", "success");

    // Clean resetting of participant selection state so dropdown resets cleanly
    setWinnerChestSearch("");
    setWinnerFoundPart(null);
    setWinnerGroupChestSearch("");
    setWinnerFoundGroup(null);
    setWinSelPartId(""); // Resets candidate dropdown in Select mode
    setWinnerForm(prev => ({
      ...prev,
      participantId: "",
      chestNumber: "",
      parish: "",
      position: "1",
      grade: "A"
    }));
  };

  const handleDeleteResult = (resId) => {
    if (confirm("ഈ ഫലം ഇല്ലാതാക്കാൻ നിങ്ങൾക്ക് ഉറപ്പാണോ?")) {
      const updatedDb = JSON.parse(JSON.stringify(db));
      const yr = updatedDb.years[currentYear];
      yr.results = yr.results.filter(r => r.id !== resId);
      saveDb(updatedDb);
      showToast("ഫലം ഇല്ലാതാക്കി!", "success");
    }
  };

  const handleSaveEditedResult = (e) => {
    e.preventDefault();
    if (!editResultModal.result) return;

    const posValid = editResultModal.result.position && editResultModal.result.position.trim() !== "";
    const gradeValid = editResultModal.result.grade && editResultModal.result.grade.trim() !== "";

    if (!posValid && !gradeValid) {
      showToast("സ്ഥാനമോ ഗ്രേഡോ ഇല്ലാത്ത ഫലം രേഖപ്പെടുത്താൻ കഴിയില്ല!", "error");
      return;
    }

    const updatedDb = JSON.parse(JSON.stringify(db));
    const yr = updatedDb.years[currentYear];

    const resToEdit = editResultModal.result;
    const p = yr.participants.find(part => part.id === resToEdit.participantId);
    const rAgeCat = resToEdit.ageCategory || (p && p.dob ? calculateAgeGroup(p.dob) : null);
    const rGender = resToEdit.gender || (p ? p.gender : null);

    const dupPosMsg = checkDuplicatePositionAssignment(
      yr.results,
      yr.participants,
      resToEdit.itemName,
      rAgeCat,
      rGender,
      resToEdit.position,
      resToEdit.id
    );

    if (dupPosMsg) {
      showToast(dupPosMsg, "error");
      return;
    }

    yr.results = yr.results.map(r => 
      r.id === editResultModal.result.id ? { ...editResultModal.result } : r
    );

    saveDb(updatedDb);
    setEditResultModal({ show: false, result: null });
    showToast("ഫലം വിജയകരമായി തിരുത്തി!", "success");
  };

  const handleBackupDatabase = async () => {
    try {
      if (window.api && window.api.dbBackup) {
        const success = await window.api.dbBackup(db);
        if (success) {
          showToast("ഡാറ്റാബേസ് വിജയകരമായി ബാക്കപ്പ് ചെയ്തു!", "success");
        }
      } else {
        const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(db, null, 2));
        const downloadAnchor = document.createElement('a');
        downloadAnchor.setAttribute("href", dataStr);
        downloadAnchor.setAttribute("download", `cml_database_backup_${currentYear}_${Date.now()}.json`);
        document.body.appendChild(downloadAnchor);
        downloadAnchor.click();
        downloadAnchor.remove();
        showToast("ഡാറ്റാബേസ് ബാക്കപ്പ് ഫയൽ ഡൗൺലോഡ് ചെയ്തു!", "success");
      }
    } catch (err) {
      showToast("ബാക്കപ്പ് ചെയ്യുമ്പോൾ പിശക് സംഭവിച്ചു: " + err.message, "error");
    }
  };

  const handleRestoreDatabase = async () => {
    try {
      if (window.api && window.api.dbRestore) {
        const restored = await window.api.dbRestore();
        if (restored) {
          setDb(restored);
          if (restored.settings && restored.settings.currentYear) {
            setCurrentYear(restored.settings.currentYear);
          }
          showToast("ഡാറ്റാബേസ് വിജയകരമായി റീസ്റ്റോർ ചെയ്തു!", "success");
        }
      } else {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = '.json';
        input.onchange = (e) => {
          const file = e.target.files[0];
          if (file) {
            const reader = new FileReader();
            reader.onload = (event) => {
              try {
                const parsed = JSON.parse(event.target.result);
                if (parsed && typeof parsed === 'object' && parsed.settings && parsed.years) {
                  saveDb(parsed);
                  if (parsed.settings.currentYear) setCurrentYear(parsed.settings.currentYear);
                  showToast("ഡാറ്റാബേസ് വിജയകരമായി റീസ്റ്റോർ ചെയ്തു!", "success");
                } else {
                  showToast("അസാധുവായ ബാക്കപ്പ് ഫയൽ ഫോർമാറ്റ്!", "error");
                }
              } catch (parseErr) {
                showToast("ഫയൽ വായിക്കുന്നതിൽ പിശക്!", "error");
              }
            };
            reader.readAsText(file);
          }
        };
        input.click();
      }
    } catch (err) {
      showToast("റീസ്റ്റോർ ചെയ്യുമ്പോൾ പിശക് സംഭവിച്ചു: " + err.message, "error");
    }
  };

  const getParticipantConflictDetails = (p, yearData) => {
    if (!p || !yearData) return [];
    const cat = calculateAgeGroup(p.dob);
    const catName = AGE_GROUPS[cat] || cat;
    const allYearParts = yearData.participants || [];

    const details = [];

    // 1. Candidate Individual Sahithya / Kalaa Item Count Limit
    const sahItems = (p.registeredItems || []).filter(id => id.startsWith('s_'));
    const kalItems = (p.registeredItems || []).filter(id => id.startsWith('k_'));

    if (sahItems.length > 2) {
      details.push({
        title: `സാഹിത്യ മത്സരങ്ങളുടെ പരിധി കവിഞ്ഞു (${catName})`,
        detail: `${catName} വിഭാഗത്തിൽ ${p.name} എന്ന മത്സരാർത്ഥി 2-ൽ കൂടുതൽ (${sahItems.length}) സാഹിത്യ മത്സരങ്ങളിൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. (രജിസ്റ്റർ ചെയ്ത ഇനങ്ങൾ: ${sahItems.map(getItemDisplayName).join(', ')}).`,
        otherParts: []
      });
    }
    if (kalItems.length > 2) {
      details.push({
        title: `കലാ മത്സരങ്ങളുടെ പരിധി കവിഞ്ഞു (${catName})`,
        detail: `${catName} വിഭാഗത്തിൽ ${p.name} എന്ന മത്സരാർത്ഥി 2-ൽ കൂടുതൽ (${kalItems.length}) കലാ മത്സരങ്ങളിൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്. (രജിസ്റ്റർ ചെയ്ത ഇനങ്ങൾ: ${kalItems.map(getItemDisplayName).join(', ')}).`,
        otherParts: []
      });
    }

    // 2. Katha Prasangam Rule (Sub-Junior, Junior, Senior only; Max 1 per parish)
    if ((p.registeredItems || []).includes('k_kadhaprasangam')) {
      if (!['sub_junior', 'junior', 'senior'].includes(cat)) {
        details.push({
          title: `കഥാപ്രസംഗം മത്സര വിഭാഗം അസാധുവാണ്`,
          detail: `കഥാപ്രസംഗം മത്സരം സബ്‌ജൂനിയർ, ജൂനിയർ, സീനിയർ വിഭാഗങ്ങൾക്ക് മാത്രമുള്ളതാണ് (${p.name} ന്റെ വിഭാഗം: ${catName}).`,
          otherParts: []
        });
      }
      const kpParishParts = allYearParts.filter(op => 
        op.parish && p.parish && op.parish.trim().toLowerCase() === p.parish.trim().toLowerCase() && 
        calculateAgeGroup(op.dob) === cat && 
        (op.registeredItems || []).includes('k_kadhaprasangam')
      );
      if (kpParishParts.length > 1) {
        details.push({
          title: `കഥാപ്രസംഗം - ഇടവക കോട്ട പരിധി കവിഞ്ഞു (${catName})`,
          detail: `${p.parish} ഇടവകയിൽ നിന്നും ${catName} വിഭാഗത്തിലെ കഥാപ്രസംഗം ഇനത്തിൽ ഈ മത്സരാർത്ഥി (${p.name}) ഉൾപ്പെടെ ആകെ ${kpParishParts.length} പേർ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (പരമാവധി അനുവദനീയമായത്: 1 പേര് മാത്രം).`,
          otherParts: kpParishParts
        });
      }
    }

    // 3. Parish Quota Limits for Individual Items (max 2 per parish per category per gender)
    (p.registeredItems || []).forEach(itemId => {
      if (itemId !== 'k_kadhaprasangam') {
        const sameQuotaParts = allYearParts.filter(op => 
          op.parish && p.parish && op.parish.trim().toLowerCase() === p.parish.trim().toLowerCase() && 
          calculateAgeGroup(op.dob) === cat && 
          op.gender && p.gender && op.gender.trim().toLowerCase() === p.gender.trim().toLowerCase() && 
          (op.registeredItems || []).includes(itemId)
        );

        if (sameQuotaParts.length > 2) {
          const itemName = getItemDisplayName(itemId);
          const genderText = (p.gender || '').toLowerCase() === 'male' ? 'ആൺകുട്ടികൾ' : 'പെൺകുട്ടികൾ';
          details.push({
            title: `${itemName} - ഇടവക കോട്ട പരിധി കവിഞ്ഞു (${catName})`,
            detail: `${p.parish} ഇടവകയിൽ നിന്നും ${catName} വിഭാഗത്തിലെ ${itemName} ഇനത്തിൽ (${genderText}) ഈ മത്സരാർത്ഥി (${p.name}) ഉൾപ്പെടെ ആകെ ${sameQuotaParts.length} പേർ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (പരമാവധി അനുവദനീയമായത്: 2 പേര്).`,
            otherParts: sameQuotaParts
          });
        }
      }
    });

    // Fallback if details is empty but p.conflictIssues exists
    if (details.length === 0 && p.conflictIssues) {
      if (Array.isArray(p.conflictIssues)) {
        p.conflictIssues.forEach(iss => {
          if (typeof iss === 'string') {
            details.push({ title: 'നിയമ ലംഘന വിവരം', detail: iss, otherParts: [] });
          } else if (typeof iss === 'object') {
            details.push(iss);
          }
        });
      }
    }

    return details;
  };

  const handleMergeExternalFile = async () => {
    try {
      let parsed = null;
      if (window.api && window.api.dbMergeSelect) {
        parsed = await window.api.dbMergeSelect();
      } else {
        await new Promise((resolve) => {
          const input = document.createElement('input');
          input.type = 'file';
          input.accept = '.json';
          input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
              const reader = new FileReader();
              reader.onload = (event) => {
                try {
                  parsed = JSON.parse(event.target.result);
                  resolve(parsed);
                } catch (parseErr) {
                  showToast("ഫയൽ വായിക്കുന്നതിൽ പിശക്!", "error");
                  resolve(null);
                }
              };
              reader.readAsText(file);
            } else {
              resolve(null);
            }
          };
          input.click();
        });
      }

      if (!parsed || typeof parsed !== 'object' || !parsed.years) {
        showToast("അസാധുവായ ഡാറ്റാബേസ് ഫയൽ ഫോർമാറ്റ്!", "error");
        return;
      }

      runMergeAuditAndProcess(parsed, 'check');
    } catch (err) {
      showToast("ഫയൽ കൂട്ടിച്ചേർക്കുമ്പോൾ പിശക് സംഭവിച്ചു: " + err.message, "error");
    }
  };

  const runMergeAuditAndProcess = (incomingDb, mode = 'check') => {
    const currentYearData = db?.years?.[currentYear] || { participants: [], results: [] };
    const incomingYearData = incomingDb?.years?.[currentYear] || incomingDb?.years?.[Object.keys(incomingDb.years)[0]];

    if (!incomingYearData || !incomingYearData.participants) {
      showToast("തിരഞ്ഞെടുത്ത ഫയലിൽ നിലവിലെ വർഷത്തെ ഡാറ്റ കാണാനില്ല!", "error");
      return;
    }

    const existingParts = [...currentYearData.participants];
    const existingResults = [...(currentYearData.results || [])];
    const incomingParts = incomingYearData.participants || [];
    const incomingResults = incomingYearData.results || [];

    const violations = [];
    const safeIncomingParts = [];

    // Track parish + item participant lists for detailed quota checking
    const parishItemPartsMap = {};

    existingParts.forEach(p => {
      const cat = calculateAgeGroup(p.dob);
      (p.registeredItems || []).forEach(itemId => {
        const key = `${p.parish}_${cat}_${p.gender}_${itemId}`;
        if (!parishItemPartsMap[key]) parishItemPartsMap[key] = [];
        parishItemPartsMap[key].push(p);
      });
    });

    // Audit incoming participants
    incomingParts.forEach(p => {
      const cat = calculateAgeGroup(p.dob);
      const catName = AGE_GROUPS[cat] || cat;
      let pViolations = [];

      // 1. Candidate Individual Sahithya / Kalaa Item Count Limit
      const sahItems = (p.registeredItems || []).filter(id => id.startsWith('s_'));
      const kalItems = (p.registeredItems || []).filter(id => id.startsWith('k_'));

      if (sahItems.length > 2) {
        pViolations.push({
          title: `സാഹിത്യ മത്സരങ്ങളുടെ പരിധി കവിഞ്ഞു (${catName})`,
          detail: `${catName} വിഭാഗത്തിൽ ${p.name} എന്ന മത്സരാർത്ഥി 2-ൽ കൂടുതൽ (${sahItems.length}) സാഹിത്യ മത്സരങ്ങളിൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.`,
          otherParts: []
        });
      }
      if (kalItems.length > 2) {
        pViolations.push({
          title: `കലാ മത്സരങ്ങളുടെ പരിധി കവിഞ്ഞു (${catName})`,
          detail: `${catName} വിഭാഗത്തിൽ ${p.name} എന്ന മത്സരാർത്ഥി 2-ൽ കൂടുതൽ (${kalItems.length}) കലാ മത്സരങ്ങളിൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.`,
          otherParts: []
        });
      }

      // 2. Katha Prasangam Rule (Sub-Junior, Junior, Senior only; Max 1 per parish)
      if ((p.registeredItems || []).includes('k_kadhaprasangam')) {
        if (!['sub_junior', 'junior', 'senior'].includes(cat)) {
          pViolations.push({
            title: `കഥാപ്രസംഗം മത്സര വിഭാഗം അസാധുവാണ്`,
            detail: `കഥാപ്രസംഗം മത്സരം സബ്‌ജൂനിയർ, ജൂനിയർ, സീനിയർ വിഭാഗങ്ങൾക്ക് മാത്രമുള്ളതാണ് (${p.name} ന്റെ വിഭാഗം: ${catName}).`,
            otherParts: []
          });
        }
        const kpKey = `${p.parish}_${cat}_k_kadhaprasangam`;
        const currentKpList = parishItemPartsMap[kpKey] || [];
        if (currentKpList.length >= 1) {
          const allKpList = [...currentKpList, p];
          pViolations.push({
            title: `കഥാപ്രസംഗം - ഇടവക കോട്ട പരിധി കവിഞ്ഞു (${catName})`,
            detail: `${p.parish} ഇടവകയിൽ നിന്നും ${catName} വിഭാഗത്തിലെ കഥാപ്രസംഗം ഇനത്തിൽ ഈ മത്സരാർത്ഥി (${p.name}) ഉൾപ്പെടെ ആകെ ${allKpList.length} പേർ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (പരമാവധി അനുവദനീയമായത്: 1 പേര് മാത്രം).`,
            otherParts: allKpList
          });
        } else {
          if (!parishItemPartsMap[kpKey]) parishItemPartsMap[kpKey] = [];
          parishItemPartsMap[kpKey].push(p);
        }
      }

      // 3. Parish Quota limits (max 2 per parish per category per gender for individual items)
      (p.registeredItems || []).forEach(itemId => {
        if (itemId !== 'k_kadhaprasangam') {
          const key = `${p.parish}_${cat}_${p.gender}_${itemId}`;
          const currentList = parishItemPartsMap[key] || [];
          if (currentList.length >= 2) {
            const allList = [...currentList, p];
            const itemName = getItemDisplayName(itemId);
            const genderText = p.gender === 'male' ? 'ആൺകുട്ടികൾ' : 'പെൺകുട്ടികൾ';
            pViolations.push({
              title: `${itemName} - ഇടവക കോട്ട പരിധി കവിഞ്ഞു (${catName})`,
              detail: `${p.parish} ഇടവകയിൽ നിന്നും ${catName} വിഭാഗത്തിലെ ${itemName} ഇനത്തിൽ (${genderText}) ഈ മത്സരാർത്ഥി (${p.name}) ഉൾപ്പെടെ ആകെ ${allList.length} പേർ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട് (പരമാവധി അനുവദനീയമായത്: 2 പേര്).`,
              otherParts: allList
            });
          } else {
            if (!parishItemPartsMap[key]) parishItemPartsMap[key] = [];
            parishItemPartsMap[key].push(p);
          }
        }
      });

      if (pViolations.length > 0) {
        violations.push({ participant: p, issues: pViolations });
      } else {
        safeIncomingParts.push(p);
      }
    });

    if (mode === 'check' && violations.length > 0) {
      setMergeConflictModal({
        show: true,
        incomingDb,
        violations,
        validCount: safeIncomingParts.length,
        violatingCount: violations.length
      });
      return;
    }

    // Execute Merge
    const mergedDb = JSON.parse(JSON.stringify(db));
    if (!mergedDb.years[currentYear]) {
      mergedDb.years[currentYear] = { activeCategory: "both", ageCategoryRules: { ...DEFAULT_DOB_RANGES }, participants: [], results: [] };
    }

    const curYr = mergedDb.years[currentYear];
    const partsToMerge = mode === 'skip_violations' ? safeIncomingParts : incomingParts;

    let addedCount = 0;
    let updatedCount = 0;

    // Existing Chest Number Set
    const usedChestNumbers = new Set(curYr.participants.map(p => p.chestNumber).filter(Boolean));

    partsToMerge.forEach(inP => {
      const matchIdx = curYr.participants.findIndex(ep => 
        (inP.membershipNo && ep.membershipNo === inP.membershipNo) ||
        (inP.masterId && ep.masterId === inP.masterId) ||
        (ep.name.trim().toLowerCase() === inP.name.trim().toLowerCase() && 
         ep.houseName.trim().toLowerCase() === inP.houseName.trim().toLowerCase() && 
         ep.parish === inP.parish)
      );

      if (matchIdx >= 0) {
        const existingP = curYr.participants[matchIdx];
        const combinedItems = Array.from(new Set([...(existingP.registeredItems || []), ...(inP.registeredItems || [])]));
        const combinedGroupItems = Array.from(new Set([...(existingP.registeredGroupItems || []), ...(inP.registeredGroupItems || [])]));
        existingP.registeredItems = combinedItems;
        existingP.registeredGroupItems = combinedGroupItems;
        const matchingV = violations.find(v => v.participant.name === inP.name || (v.participant.membershipNo && v.participant.membershipNo === inP.membershipNo));
        if (mode === 'flag_violations' && matchingV) {
          existingP.hasConflictWarning = true;
          existingP.conflictIssues = matchingV.issues;
        }
        updatedCount++;
      } else {
        const newP = { ...inP };
        if (!newP.id) newP.id = 'part-' + Date.now() + '-' + Math.floor(Math.random() * 1000);
        if (!newP.masterId) newP.masterId = 'PID-' + (curYr.participants.length + 1001);

        if (newP.chestNumber && usedChestNumbers.has(newP.chestNumber)) {
          let nextChest = 101;
          while (usedChestNumbers.has(String(nextChest))) {
            nextChest++;
          }
          newP.chestNumber = String(nextChest);
        }

        if (newP.chestNumber) usedChestNumbers.add(newP.chestNumber);
        const matchingV = violations.find(v => v.participant.name === inP.name || (v.participant.membershipNo && v.participant.membershipNo === inP.membershipNo));
        if (mode === 'flag_violations' && matchingV) {
          newP.hasConflictWarning = true;
          newP.conflictIssues = matchingV.issues;
        }

        curYr.participants.push(newP);
        addedCount++;
      }
    });

    // Merge Results
    incomingResults.forEach(inR => {
      const matchRes = curYr.results.find(er => 
        er.itemName === inR.itemName && er.parish === inR.parish && er.position === inR.position
      );
      if (!matchRes) {
        curYr.results.push({ ...inR, id: 'res-' + Date.now() + '-' + Math.floor(Math.random() * 1000) });
      }
    });

    saveDb(mergedDb);
    setMergeConflictModal({ show: false, incomingDb: null, violations: [], validCount: 0, violatingCount: 0 });
    showToast(`ഡാറ്റാബേസ് സംയോജിപ്പിച്ചു! (${addedCount} പുതിയ മത്സരാർത്ഥികൾ ചേർത്തു, ${updatedCount} വിവരങ്ങൾ പുതുക്കി)`, "success");
  };

  const handlePrint = () => {
    if (window.api) {
      if (window.api.printPage) {
        window.api.printPage();
      } else if (window.api.printWindow) {
        window.api.printWindow();
      } else {
        window.print();
      }
    } else {
      window.print();
    }
  };

  return (
    <div className="app-container">
      {/* Header Bar */}
      <header className="app-header no-print">
        <div className="header-left">
          <img src={cmlLogo} alt="CML Logo" style={{ height: '44px', width: '44px', borderRadius: '50%', objectFit: 'cover' }} />
          <div>
            <h1 style={{ fontSize: '1.25rem', fontWeight: 'bold', margin: 0 }}>CML Programme Management</h1>
            <p style={{ fontSize: '0.75rem', opacity: 0.85, margin: 0 }}>ചെറുപുഷ്പ മിഷൻ ലീഗ് സാഹിത്യ - കലാ മത്സരങ്ങൾ</p>
          </div>
        </div>

        {/* Global Competition Category Switcher */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'rgba(255,255,255,0.15)', padding: '4px 8px', borderRadius: '20px' }}>
          <span style={{ fontSize: '0.8rem', fontWeight: '600' }}>മത്സരം:</span>
          <button 
            type="button" 
            className={`btn ${activeCategory === 'sahithya' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ padding: '2px 10px', fontSize: '0.8rem' }}
            onClick={() => handleSetCategoryMode('sahithya')}
          >
            സാഹിത്യം
          </button>
          <button 
            type="button" 
            className={`btn ${activeCategory === 'kalaa' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ padding: '2px 10px', fontSize: '0.8rem' }}
            onClick={() => handleSetCategoryMode('kalaa')}
          >
            കല
          </button>
          <button 
            type="button" 
            className={`btn ${activeCategory === 'both' ? 'btn-primary' : 'btn-secondary'}`} 
            style={{ padding: '2px 10px', fontSize: '0.8rem' }}
            onClick={() => handleSetCategoryMode('both')}
          >
            രണ്ടും (Both)
          </button>
        </div>

        <div className="header-right">
          <button
            type="button"
            className="theme-toggle"
            title={cloudStatus === 'connected' ? 'Cloud Synced — Click to Refresh' : 'Sync with Cloud'}
            onClick={handleSyncFromCloud}
            style={{ width: 'auto', borderRadius: '8px', padding: '0 10px', gap: '5px', fontSize: '0.78rem', fontWeight: '700', backgroundColor: cloudStatus === 'connected' ? 'rgba(22, 163, 74, 0.35)' : cloudStatus === 'error' ? 'rgba(220, 38, 38, 0.45)' : 'rgba(255,255,255,0.18)' }}
          >
            <RefreshCw size={14} />
            <span>{cloudStatus === 'connected' ? 'Cloud' : cloudStatus === 'error' ? 'Sync Error' : 'Sync'}</span>
          </button>
          <div className="year-selector">
            <span style={{ fontSize: '0.85rem' }}>വർഷം:</span>
            <select 
              className="year-select"
              value={currentYear}
              onChange={(e) => setCurrentYear(e.target.value)}
            >
              {Object.keys(db?.years || { [currentYear]: true }).map(yr => (
                <option key={yr} value={yr}>{yr}</option>
              ))}
            </select>
          </div>

          <button className="theme-toggle" onClick={() => setTheme(theme === 'light' ? 'dark' : 'light')}>
            {theme === 'light' ? <Moon size={18} /> : <Sun size={18} />}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <nav className="app-nav no-print">
        <button className={`nav-tab ${activeTab === 'home' ? 'active' : ''}`} onClick={() => setActiveTab('home')}>
          <Trophy size={18} /> ഹോം (Home)
        </button>
        <button className={`nav-tab ${activeTab === 'participants' ? 'active' : ''}`} onClick={() => setActiveTab('participants')}>
          <Users size={18} /> മത്സരാർത്ഥികൾ (Participants)
        </button>
        <button className={`nav-tab ${activeTab === 'winners-entry' ? 'active' : ''}`} onClick={() => setActiveTab('winners-entry')}>
          <Award size={18} /> വിജയികളെ ചേർക്കുക (Enter Winners)
        </button>
        <button className={`nav-tab ${activeTab === 'results-view' ? 'active' : ''}`} onClick={() => setActiveTab('results-view')}>
          <FileText size={18} /> ഫലങ്ങൾ (Results View)
        </button>
        <button className={`nav-tab ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
          <SettingsIcon size={18} /> ക്രമീകരണങ്ങൾ (Settings)
        </button>
      </nav>

      {/* 1. DEDICATED PRINT ONLY SECTION FOR REGISTERED PARTICIPANTS ROSTER */}
      {(activeTab === 'participants' || showParticipantsModal) && (
        <div className="print-only">
          <table className="cml-table print-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', marginTop: '0' }}>
            <colgroup>
              <col style={{ width: '5%' }} />
              {incRegSlNoInPrint && <col style={{ width: '8%' }} />}
              {incMemNoInPrint && <col style={{ width: '9%' }} />}
              <col style={{ width: '8%' }} />
              <col style={{ width: (incRegSlNoInPrint && incMemNoInPrint) ? '24%' : ((incRegSlNoInPrint || incMemNoInPrint) ? '26%' : '30%') }} />
              <col style={{ width: (incRegSlNoInPrint && incMemNoInPrint) ? '12%' : ((incRegSlNoInPrint || incMemNoInPrint) ? '13%' : '15%') }} />
              <col style={{ width: (incRegSlNoInPrint && incMemNoInPrint) ? '8%' : ((incRegSlNoInPrint || incMemNoInPrint) ? '9%' : '10%') }} />
              <col style={{ width: '5%' }} />
              <col style={{ width: (incRegSlNoInPrint && incMemNoInPrint) ? '21%' : ((incRegSlNoInPrint || incMemNoInPrint) ? '23%' : '27%') }} />
            </colgroup>
            <thead style={{ display: 'table-header-group' }}>
              <tr>
                <th colSpan={7 + (incRegSlNoInPrint ? 1 : 0) + (incMemNoInPrint ? 1 : 0)} style={{ border: 'none', padding: '0 0 10px 0', background: 'transparent', color: '#000', textAlign: 'left' }}>
                  <div className="printable-header" style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '8px' }}>
                      <img src={cmlLogo} alt="Logo" style={{ height: '48px', width: '48px', borderRadius: '50%' }} />
                      <div>
                        <h2>ചെറുപുഷ്പ മിഷൻ ലീഗ് സാഹിത്യ - കലാ മത്സരങ്ങൾ {currentYear}</h2>
                        <p style={{ margin: 0, fontWeight: 'bold' }}>REGISTERED PARTICIPANTS ROSTER</p>
                      </div>
                    </div>

                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '8.5pt', fontWeight: 'bold', borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000', paddingTop: '4px', paddingBottom: '4px' }}>
                      <span><strong>മത്സര തരം:</strong> {partModalCategoryMode === 'sahithya' ? 'SAHITHYA ONLY' : partModalCategoryMode === 'kalaa' ? 'KALAA ONLY' : 'BOTH (SAHITHYA & KALAA)'}</span>
                      <span><strong>ഇടവക:</strong> {partFilterMode === 'multi' ? (partSelectedParishes.length === 0 ? 'All Parishes' : partSelectedParishes.join(', ')) : (partParishFilter || 'All Parishes')}</span>
                      <span><strong>വിഭാഗം:</strong> {partFilterMode === 'multi' ? (partSelectedCategories.length === 0 ? 'All Categories' : partSelectedCategories.map(c => AGE_GROUPS_SHORT_ENG[c] || c).join(', ')) : (partCategoryFilter ? AGE_GROUPS_SHORT_ENG[partCategoryFilter] : 'All Categories')}</span>
                      <span><strong>ജെൻഡർ:</strong> {partFilterMode === 'multi' ? (partSelectedGenders.length === 0 ? 'All Genders' : partSelectedGenders.map(g => g === 'male' ? 'Male' : 'Female').join(', ')) : (partGenderFilter ? (partGenderFilter === 'male' ? 'Male' : 'Female') : 'All Genders')}</span>
                      {(partFilterMode === 'multi' ? partSelectedItems.length > 0 : partItemFilter) && (
                        <span><strong>ഇനങ്ങൾ:</strong> {partFilterMode === 'multi' ? partSelectedItems.map(getItemDisplayName).join(', ') : getItemDisplayName(partItemFilter)}</span>
                      )}
                      <span><strong>ആകെ മത്സരാർത്ഥികൾ:</strong> {filteredParticipants.length} പേർ</span>
                    </div>
                  </div>
                </th>
              </tr>
              <tr>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>ക്രമ നം.</th>
                {incRegSlNoInPrint && (
                  <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>അംഗത്വ ലിസ്റ്റ് നം.</th>
                )}
                {incMemNoInPrint && (
                  <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>അംഗത്വ നം.</th>
                )}
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>ചെസ്റ്റ് നം.</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'left', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>
                  <div>പേര് (Name)</div>
                  <div style={{ fontWeight: 'normal', fontSize: '0.85em' }}>വീട്ടുപേര് (House Name)</div>
                </th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'left', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>ഇടവക (Parish)</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>വിഭാഗം</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>ജെൻഡർ</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'left', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>രജിസ്റ്റർ ചെയ്ത മത്സര ഇനങ്ങൾ</th>
              </tr>
            </thead>
            <tbody>
              {filteredParticipants.map((p, idx) => (
                <tr key={p.id}>
                  <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>{idx + 1}</td>
                  {incRegSlNoInPrint && (
                    <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}><strong>{p.registerSlNo || '-'}</strong></td>
                  )}
                  {incMemNoInPrint && (
                    <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}><strong>{p.membershipNo || '-'}</strong></td>
                  )}
                  <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}><strong>{p.chestNumber || '-'}</strong></td>
                  <td style={{ border: '1px solid #000', padding: '4px 3px', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>
                    <div>
                      <strong>{p.name}</strong>
                      {(() => {
                        const pViolations = conflictWarningMap[p.id];
                        if (!pViolations || pViolations.length === 0) return null;
                        return (
                          <span 
                            onClick={(e) => {
                              e.stopPropagation();
                              const currentYrData = db?.years?.[currentYear] || { participants: [] };
                              const issues = getParticipantConflictDetails(p, currentYrData);
                              setConflictDetailsModal({
                                show: true,
                                participantName: p.name,
                                parish: p.parish,
                                category: AGE_GROUPS[calculateAgeGroup(p.dob)] || '-',
                                issues: issues.length > 0 ? issues : (conflictWarningMap[p.id] || [])
                              });
                            }}
                            style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.8em', marginLeft: '6px', cursor: 'pointer' }}
                            title="നിയമ ലംഘന വിവരങ്ങൾ കാണാൻ ക്ലിക്ക് ചെയ്യുക"
                          >
                            ⚠️ (നിയമ ലംഘനം)
                          </span>
                        );
                      })()}
                    </div>
                    <div style={{ fontSize: '0.9em' }}>{p.houseName}</div>
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px 3px', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>{p.parish}</td>
                  <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>
                    {AGE_GROUPS_SHORT_ENG[calculateAgeGroup(p.dob)] || '-'}
                  </td>
                  <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>{p.gender === 'male' ? 'M' : 'F'}</td>
                  <td style={{ border: '1px solid #000', padding: '4px 3px', verticalAlign: 'top', fontSize: (incRegSlNoInPrint && incMemNoInPrint) ? '8pt' : '8.5pt' }}>
                    {(() => {
                      const { indItems, grpItems } = getDisplayItemsForParticipant(p);
                      return (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                          {indItems.map(id => (
                            <div key={id} style={{ lineHeight: '1.2' }}>• {getItemDisplayName(id)}</div>
                          ))}
                          {grpItems.map(id => (
                            <div key={id} style={{ lineHeight: '1.2', fontWeight: 'bold' }}>• {getItemDisplayName(id)} (G)</div>
                          ))}
                        </div>
                      );
                    })()}
                  </td>
                </tr>
              ))}
              {filteredParticipants.length === 0 && (
                <tr>
                  <td colSpan={7 + (incRegSlNoInPrint ? 1 : 0) + (incMemNoInPrint ? 1 : 0)} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                    മത്സരാർത്ഥികളെയൊന്നും കണ്ടെത്തിയില്ല.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      {/* 2. DEDICATED PRINT ONLY SECTION FOR RESULTS VIEW (Active for Results View Tab or Modal) */}
      {(activeTab === 'results-view' || showResultsModal || showEditResultsModal) && (
        <div className="print-only">
          <table className="cml-table print-table" style={{ width: '100%', tableLayout: 'fixed', borderCollapse: 'collapse', marginTop: '0' }}>
            <colgroup>
              <col style={{ width: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '4%' : '5%' }} />
              {incRegSlNoInResultsPrint && <col style={{ width: '7%' }} />}
              {incMemNoInResultsPrint && <col style={{ width: '7%' }} />}
              <col style={{ width: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '17%' : ((incRegSlNoInResultsPrint || incMemNoInResultsPrint) ? '18%' : '20%') }} />
              <col style={{ width: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '10%' : ((incRegSlNoInResultsPrint || incMemNoInResultsPrint) ? '11%' : '12%') }} />
              <col style={{ width: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '22%' : ((incRegSlNoInResultsPrint || incMemNoInResultsPrint) ? '24%' : '26%') }} />
              <col style={{ width: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '15%' : ((incRegSlNoInResultsPrint || incMemNoInResultsPrint) ? '16%' : '17%') }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '6%' }} />
              <col style={{ width: '7%' }} />
            </colgroup>
            <thead style={{ display: 'table-header-group' }}>
              <tr>
                <th colSpan={8 + (incRegSlNoInResultsPrint ? 1 : 0) + (incMemNoInResultsPrint ? 1 : 0)} style={{ border: 'none', padding: '0 0 10px 0', background: 'transparent', color: '#000', textAlign: 'left' }}>
                  <div className="printable-header" style={{ marginBottom: '6px' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '1rem', marginBottom: '8px' }}>
                      <img src={cmlLogo} alt="Logo" style={{ height: '48px', width: '48px', borderRadius: '50%' }} />
                      <div>
                        <h2>ചെറുപുഷ്പ മിഷൻ ലീഗ് സാഹിത്യ - കലാ മത്സരങ്ങൾ {currentYear}</h2>
                        <p style={{ margin: 0, fontWeight: 'bold', fontSize: '1.2rem', color: '#000' }}>മത്സരഫലങ്ങൾ</p>
                      </div>
                    </div>

                    {/* Filter Summary Bar between two black lines */}
                    <div style={{ display: 'flex', justifyContent: 'space-between', flexWrap: 'wrap', gap: '8px', fontSize: '8.5pt', fontWeight: 'bold', borderTop: '1.5px solid #000', borderBottom: '1.5px solid #000', paddingTop: '4px', paddingBottom: '4px' }}>
                      <span><strong>മത്സര തരം:</strong> {resModalCategoryMode === 'sahithya' ? 'SAHITHYA ONLY' : resModalCategoryMode === 'kalaa' ? 'KALAA ONLY' : 'BOTH (SAHITHYA & KALAA)'}</span>
                      <span><strong>ഇടവക:</strong> {resFilterMode === 'multi' ? (resSelectedParishes.length === 0 ? 'All Parishes' : resSelectedParishes.join(', ')) : (resParishFilter || 'All Parishes')}</span>
                      <span><strong>വിഭാഗം:</strong> {resFilterMode === 'multi' ? (resSelectedCategories.length === 0 ? 'All Categories' : resSelectedCategories.map(c => AGE_GROUPS_SHORT_ENG[c] || c).join(', ')) : (resCategoryFilter ? (AGE_GROUPS_SHORT_ENG[resCategoryFilter] || AGE_GROUPS[resCategoryFilter]) : 'All Categories')}</span>
                      <span><strong>ജെൻഡർ:</strong> {resFilterMode === 'multi' ? (resSelectedGenders.length === 0 ? 'All Genders' : resSelectedGenders.map(g => g === 'male' ? 'Male' : 'Female').join(', ')) : (resGenderFilter === 'male' ? 'Male' : resGenderFilter === 'female' ? 'Female' : 'All Genders')}</span>
                      {(resFilterMode === 'multi' ? resSelectedItems.length > 0 : resItemFilter) && (
                        <span><strong>ഇനങ്ങൾ:</strong> {resFilterMode === 'multi' ? resSelectedItems.map(getItemDisplayName).join(', ') : getItemDisplayName(resItemFilter)}</span>
                      )}
                      <span><strong>ആകെ ഫലങ്ങൾ:</strong> {filteredResultsMaster.length}</span>
                      <span><strong>ആകെ പോയിന്റ്:</strong> {totalSelectedPoints}</span>
                    </div>
                  </div>
                </th>
              </tr>
              <tr>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>ക്രമ നം.</th>
                {incRegSlNoInResultsPrint && (
                  <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>അംഗത്വ ലിസ്റ്റ് നം.</th>
                )}
                {incMemNoInResultsPrint && (
                  <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>അംഗത്വ നം.</th>
                )}
                <th style={{ border: '1px solid #000', padding: '5px 4px', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>മത്സര ഇനം (Item)</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>വിഭാഗം (Category)</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'left', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>
                  <div>പേര് (Name)</div>
                  <div style={{ fontWeight: 'normal', fontSize: '0.85em' }}>വീട്ടുപേര് (House Name)</div>
                </th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>ഇടവക (Parish)</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>സ്ഥാനം</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>ഗ്രേഡ്</th>
                <th style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>പോയിന്റ്</th>
              </tr>
            </thead>
            <tbody>
              {filteredResultsMaster.map((r, idx) => {
                const p = participants.find(part => part.id === r.participantId);
                const ageGroupKey = r.ageCategory || (p ? calculateAgeGroup(p.dob) : null);
                const baseAgeGroup = ageGroupKey ? (AGE_GROUPS_SHORT_ENG[ageGroupKey] || AGE_GROUPS[ageGroupKey] || ageGroupKey) : '-';
                const genderVal = r.gender || (p ? p.gender : null);
                const genderLabel = genderVal === 'male' ? 'Male' : (genderVal === 'female' ? 'Female' : (r.itemType === 'group' ? 'Group' : ''));
                const isGroupItem = r.itemType === 'group' || !r.participantId;
                      const ageGroupText = isGroupItem ? '-' : (genderLabel && baseAgeGroup !== '-' ? `${baseAgeGroup} (${genderLabel})` : baseAgeGroup);
                const pts = calculateResultPoints(r);

                return (
                  <tr key={r.id}>
                    <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>{idx + 1}</td>
                    {incRegSlNoInResultsPrint && (
                      <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}><strong>{p?.registerSlNo || '-'}</strong></td>
                    )}
                    {incMemNoInResultsPrint && (
                      <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}><strong>{p?.membershipNo || '-'}</strong></td>
                    )}
                    <td style={{ border: '1px solid #000', padding: '4px 3px', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}><strong>{getItemDisplayName(r.itemName)}</strong></td>
                    <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>{ageGroupText}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 3px', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>
                      <div>
                        <strong>{p ? p.name : 'ഗ്രൂപ്പ് ടീം'}</strong>
                        {(() => {
                          if (!p) return null;
                          const pViolations = conflictWarningMap[p.id];
                          if (!pViolations || pViolations.length === 0) return null;
                          return (
                            <span 
                              onClick={(e) => {
                                e.stopPropagation();
                                const currentYrData = db?.years?.[currentYear] || { participants: [] };
                                const issues = getParticipantConflictDetails(p, currentYrData);
                                setConflictDetailsModal({
                                  show: true,
                                  participantName: p.name,
                                  parish: p.parish,
                                  category: AGE_GROUPS[calculateAgeGroup(p.dob)] || '-',
                                  issues: issues.length > 0 ? issues : (conflictWarningMap[p.id] || [])
                                });
                              }}
                              style={{ color: '#dc2626', fontWeight: 'bold', fontSize: '0.8em', marginLeft: '6px', cursor: 'pointer' }}
                              title="നിയമ ലംഘന വിവരങ്ങൾ കാണാൻ ക്ലിക്ക് ചെയ്യുക"
                            >
                              ⚠️ (നിയമ ലംഘനം)
                            </span>
                          );
                        })()}
                      </div>
                      {p && p.houseName && <div style={{ fontSize: '0.9em' }}>{p.houseName}</div>}
                    </td>
                    <td style={{ border: '1px solid #000', padding: '4px 3px', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>{r.parish}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}><strong>{r.position || '-'}</strong></td>
                    <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>{r.grade || '-'}</td>
                    <td style={{ border: '1px solid #000', padding: '4px 3px', textAlign: 'center', verticalAlign: 'top', fontWeight: 'bold', fontSize: (incRegSlNoInResultsPrint && incMemNoInResultsPrint) ? '8pt' : '8.5pt' }}>{pts > 0 ? pts : '-'}</td>
                  </tr>
                );
              })}
              {filteredResultsMaster.length > 0 && (
                <tr style={{ backgroundColor: '#f0f4ff', fontWeight: 'bold' }}>
                  <td colSpan={4 + (incRegSlNoInResultsPrint ? 1 : 0) + (incMemNoInResultsPrint ? 1 : 0)} style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'right', fontSize: '8.5pt' }}>
                    ആകെ പോയിന്റ് (Total Points):
                  </td>
                  <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: '8.5pt' }}>-</td>
                  <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: '8.5pt' }}>-</td>
                  <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: '8.5pt' }}>-</td>
                  <td style={{ border: '1px solid #000', padding: '5px 4px', textAlign: 'center', fontSize: '9pt', color: '#000' }}>
                    <strong>{totalSelectedPoints}</strong>
                  </td>
                </tr>
              )}
              {filteredResultsMaster.length === 0 && (
                <tr>
                  <td colSpan={7 + (incRegSlNoInResultsPrint ? 1 : 0) + (incMemNoInResultsPrint ? 1 : 0)} style={{ border: '1px solid #000', padding: '10px', textAlign: 'center' }}>
                    മത്സരഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      )}

      <main className="app-main">
        {/* --- Tab 1: Home Dashboard --- */}
        {activeTab === 'home' && (
          <div>
            <div className="results-filter-bar no-print" style={{ marginBottom: '1.5rem', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
              <div 
                className="card" 
                style={{ cursor: 'pointer', marginBottom: 0, backgroundColor: 'var(--bg-secondary)', borderLeft: '5px solid var(--primary-color)' }}
                onClick={() => setActiveTab('participants')}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Users size={36} style={{ color: 'var(--primary-color)' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>ആകെ മത്സരാർത്ഥികൾ (Total Participants)</h3>
                    <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{participants.length} പേർ</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--primary-color)' }}>വിവരങ്ങൾ കാണാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക &rarr;</span>
                  </div>
                </div>
              </div>

              <div 
                className="card" 
                style={{ cursor: 'pointer', marginBottom: 0, backgroundColor: 'var(--bg-secondary)', borderLeft: '5px solid var(--gold-color)' }}
                onClick={() => {
                  setActiveTab('results-view');
                  setShowResultsModal(true);
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                  <Award size={36} style={{ color: 'var(--gold-color)' }} />
                  <div>
                    <h3 style={{ margin: 0, fontSize: '1rem', color: 'var(--text-muted)' }}>പ്രഖ്യാപിച്ച ഫലങ്ങൾ (Declared Results)</h3>
                    <p style={{ margin: 0, fontSize: '1.8rem', fontWeight: 'bold' }}>{results.length} എണ്ണം</p>
                    <span style={{ fontSize: '0.8rem', color: 'var(--gold-color)' }}>ഫലങ്ങൾ കാണാൻ ഇവിടെ ക്ലിക്ക് ചെയ്യുക &rarr;</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="dashboard-grid">
              {/* Leaderboard Table */}
              <div className="card">
                <h2 className="card-title">
                  <span>ഇടവക തിരിച്ചുള്ള ലീഡർബോർഡ് (Parish Standings)</span>
                </h2>
                <div className="table-container">
                  <table className="cml-table">
                    <thead>
                      <tr>
                        <th>റാങ്ക്</th>
                        <th>ഇടവക / യൂണിറ്റ്</th>
                        <th>സാഹിത്യം</th>
                        <th>കല</th>
                        <th>ആകെ ലഭിച്ച പോയിന്റുകൾ</th>
                      </tr>
                    </thead>
                    <tbody>
                      {standings.map((st) => {
                        const isTop3 = typeof st.rank === 'number' && st.rank <= 3;
                        const rankClass = isTop3 ? `rank-row-${st.rank}` : '';
                        const pillClass = isTop3 ? `rank-pill-${st.rank}` : '';
                        const medal = st.rank === 1 ? '🥇 ' : st.rank === 2 ? '🥈 ' : st.rank === 3 ? '🥉 ' : '';

                        return (
                          <tr key={st.parish} className={rankClass}>
                            <td>
                              <span className={pillClass}>{medal}{st.rank}</span>
                            </td>
                            <td><strong>{st.parish}</strong></td>
                            <td>{st.sahithya}</td>
                            <td>{st.kalaa}</td>
                            <td><strong style={{ fontSize: '1.15rem', color: 'var(--accent-color)' }}>{st.total}</strong></td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Standalone Grade Calculator */}
              <div className="card">
                <h2 className="card-title" style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Award size={20} style={{ color: 'var(--primary-color)' }} />
                  <span>ഗ്രേഡ് കാൽക്കുലേറ്റർ (Grade Calculator)</span>
                </h2>
                
                <form onSubmit={handleCalculateGrade} style={{ display: 'flex', flexDirection: 'column', gap: '0.85rem' }}>
                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>1. ജഡ്ജിമാരുടെ എണ്ണം (Select Judges) *</label>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '0.5rem' }}>
                      <button 
                        type="button" 
                        className={`btn ${calcMaxMark === '200' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: 'bold' }}
                        onClick={() => {
                          setCalcMaxMark('200');
                          setCalcResult(null);
                        }}
                      >
                        2 Judges (2 ജഡ്ജിമാർ)
                      </button>
                      <button 
                        type="button" 
                        className={`btn ${calcMaxMark === '300' ? 'btn-primary' : 'btn-secondary'}`}
                        style={{ padding: '8px 10px', fontSize: '0.85rem', fontWeight: 'bold' }}
                        onClick={() => {
                          setCalcMaxMark('300');
                          setCalcResult(null);
                        }}
                      >
                        3 Judges (3 ജഡ്ജിമാർ)
                      </button>
                    </div>
                  </div>

                  <div className="form-group">
                    <label className="form-label" style={{ fontWeight: 'bold' }}>2. ലഭിച്ച ആകെ മാർക്ക് (Enter Total Mark - {calcMaxMark}-ൽ) *</label>
                    <input 
                      type="number" 
                      step="0.1" 
                      min="0"
                      max={calcMaxMark}
                      className="form-input" 
                      placeholder={`മാർക്ക് നൽകുക (${calcMaxMark}-ൽ)`}
                      value={calcMark}
                      onChange={(e) => {
                        setCalcMark(e.target.value);
                        setCalcResult(null);
                      }}
                      required
                    />
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '9px 14px', fontWeight: 'bold', width: '100%' }}>
                    <Award size={16} /> ഗ്രേഡ് കണ്ടെത്തുക (Get Grade)
                  </button>
                </form>

                {calcResult && (
                  <div style={{ marginTop: '1rem', padding: '0.85rem', borderRadius: 'var(--radius-md)', backgroundColor: 'var(--bg-tertiary)', border: `2px solid ${calcResult.badgeColor}`, textAlign: 'center' }}>
                    <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '3px' }}>
                      ലഭിച്ച മാർക്ക്: <strong style={{ color: 'var(--text-main)' }}>{calcResult.mark} / {calcResult.max}</strong> &bull; ശതമാനം: <strong style={{ color: 'var(--text-main)' }}>{calcResult.percentage}%</strong>
                    </div>
                    <div style={{ fontSize: '1.3rem', fontWeight: 'bold', color: calcResult.badgeColor, marginTop: '4px' }}>
                      ഗ്രേഡ്: {calcResult.grade}
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 2: Participants Registration Form & Modal Trigger Bar --- */}
        {activeTab === 'participants' && (
          <div>
            {/* Registration Form */}
            <div className="card no-print">
              <h2 className="card-title">
                <span>{editingPartId ? "മത്സരാർത്ഥിയുടെ വിവരങ്ങൾ തിരുത്തുക (Edit)" : "പുതിയ മത്സരാർത്ഥിയെ ചേർക്കുക (Add Participant)"}</span>
                {editingPartId && (
                  <button className="btn btn-secondary" onClick={resetPartForm}>അസാധുവാക്കുക (Cancel)</button>
                )}
              </h2>

              <form onSubmit={handleSaveParticipant}>
                <div className="form-grid" style={{ columnGap: '2rem', rowGap: '1.25rem' }}>
                  <div className="form-group">
                    <label className="form-label">യൂണിറ്റ് / ഇടവക (Parish) *</label>
                    <select 
                      className="form-select"
                      value={partForm.parish}
                      onChange={(e) => handleParishChange(e.target.value)}
                    >
                      {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  {/* Name Field with Auto-Blur Hiding for Auto-Suggest Dropdown */}
                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">മത്സരാർത്ഥിയുടെ പേര് (Name in English) *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Enter Name (e.g. Justin)"
                      value={partForm.name}
                      onChange={(e) => handleNameInputChange(toTitleCase(e.target.value))}
                      onFocus={(e) => handleNameInputChange(toTitleCase(e.target.value))}
                      onBlur={() => {
                        setTimeout(() => {
                          setShowNameSuggestions(false);
                        }, 200);
                      }}
                      onKeyDown={handleNameKeyDown}
                      required
                    />

                    {/* Pop-up Box for Candidate Auto-Suggest */}
                    {showNameSuggestions && nameSuggestions.length > 0 && (
                      <div className="auto-suggest-dropdown" style={{
                        position: 'absolute',
                        top: '100%',
                        left: 0,
                        right: 0,
                        backgroundColor: 'var(--bg-primary)',
                        border: '2px solid var(--primary-color)',
                        borderRadius: 'var(--radius-md)',
                        boxShadow: 'var(--shadow-lg)',
                        zIndex: 1000,
                        maxHeight: '250px',
                        overflowY: 'auto',
                        marginTop: '4px'
                      }}>
                        <div style={{ padding: '6px 10px', fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between' }}>
                          <span>💡 {partForm.parish} ഇടവകയിലെ മത്സരാർത്ഥികൾ ({nameSuggestions.length} എണ്ണം):</span>
                          <span>Press ENTER / Click</span>
                        </div>
                        {nameSuggestions.map((item, idx) => (
                          <div 
                            key={item.id}
                            style={{
                              padding: '8px 12px',
                              cursor: 'pointer',
                              backgroundColor: idx === selectedSuggestionIdx ? 'var(--primary-light)' : 'transparent',
                              color: idx === selectedSuggestionIdx ? 'var(--primary-color)' : 'var(--text-main)',
                              borderBottom: '1px solid var(--border-color)',
                              display: 'flex',
                              justify: 'space-between',
                              alignItems: 'center'
                            }}
                            onMouseDown={(e) => {
                              e.preventDefault();
                              selectParticipantSuggestion(item);
                            }}
                            onMouseEnter={() => setSelectedSuggestionIdx(idx)}
                          >
                            <div>
                              <strong style={{ fontSize: '0.9rem', color: 'var(--primary-color)' }}>{item.name}</strong>{" "}
                              <span style={{ fontSize: '0.8rem', fontWeight: '500' }}>
                                ({item.houseName ? item.houseName + ' House' : 'No House Name'})
                              </span>
                              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>
                                ഇടവക: <strong>{item.parish}</strong> | {item.gender === 'male' ? 'Male' : 'Female'}{item.registerSlNo ? ` | Reg Sl. No: ${item.registerSlNo}` : ''}
                              </div>
                            </div>
                            <div style={{ textAlign: 'right' }}>
                              <span style={{ fontSize: '0.75rem', fontWeight: 'bold', backgroundColor: 'var(--bg-tertiary)', padding: '2px 8px', borderRadius: '4px', display: 'inline-block' }}>
                                {item.chestNumber ? `Chest: ${item.chestNumber}` : 'ലോഡ് ചെയ്യുക (ENTER)'}
                              </span>
                            </div>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">വീട്ടുപേര് (House Name) *</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Enter House Name"
                      value={partForm.houseName}
                      onChange={(e) => setPartForm({ ...partForm, houseName: toTitleCase(e.target.value) })}
                      required
                    />
                  </div>

                  <div className="form-group" style={{ position: 'relative' }}>
                    <label className="form-label">ജനനത്തീയതി (Date of Birth) *</label>
                    <input 
                      type="date" 
                      className="form-input"
                      value={partForm.dob}
                      onChange={(e) => setPartForm({ ...partForm, dob: e.target.value, registeredItems: [], registeredGroupItems: [] })}
                      required
                    />
                    {partForm.dob && (
                      <div style={{ position: 'absolute', top: '100%', left: 0, marginTop: '2px', zIndex: 10 }}>
                        {calculateAgeGroup(partForm.dob) ? (
                          <span style={{ backgroundColor: 'var(--primary-color)', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', display: 'inline-block' }}>
                            വിഭാഗം: {AGE_GROUPS[calculateAgeGroup(partForm.dob)]}
                          </span>
                        ) : (
                          <span style={{ backgroundColor: '#dc2626', color: '#ffffff', padding: '2px 8px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', boxShadow: '0 1px 4px rgba(0,0,0,0.15)', whiteSpace: 'nowrap', display: 'inline-block' }}>
                            നിർവ്വചിക്കപ്പെട്ട പ്രായ പരിധികളിൽ വരുന്നില്ല!
                          </span>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="form-group">
                    <label className="form-label">അംഗത്വ നമ്പർ (Membership No.)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Enter Member No."
                      value={partForm.membershipNo}
                      onChange={(e) => setPartForm({ ...partForm, membershipNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group">
                    <label className="form-label">അംഗത്വ ലിസ്റ്റിലെ ക്രമ നമ്പർ (Reg. Sl. No.)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      placeholder="Enter Reg. Sl. No."
                      value={partForm.registerSlNo || ""}
                      onChange={(e) => setPartForm({ ...partForm, registerSlNo: e.target.value })}
                    />
                  </div>

                  <div className="form-group" style={{ position: 'relative', paddingRight: '0.75rem', boxSizing: 'border-box' }}>
                    <label className="form-label" style={{ fontWeight: 'bold' }}>ജെൻഡർ (Gender) *</label>
                    <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                      <select 
                        className="form-select"
                        value={partForm.gender}
                        style={{
                          backgroundColor: partForm.gender === 'female' ? '#fce7f3' : '#dbeafe',
                          color: partForm.gender === 'female' ? '#be185d' : '#1d4ed8',
                          borderColor: partForm.gender === 'female' ? '#ec4899' : '#3b82f6',
                          fontWeight: 'bold',
                          fontSize: '0.95rem',
                          paddingRight: '2.5rem',
                          width: '100%',
                          boxSizing: 'border-box'
                        }}
                        onChange={(e) => {
                          setPartForm({ ...partForm, gender: e.target.value, registeredItems: [], registeredGroupItems: [] });
                          if (partForm.name) handleNameInputChange(partForm.name);
                        }}
                      >
                        <option value="male" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontWeight: 'bold' }}>
                          👨 ആൺകുട്ടി (Male)
                        </option>
                        <option value="female" style={{ backgroundColor: '#fce7f3', color: '#be185d', fontWeight: 'bold' }}>
                          👩 പെൺകുട്ടി (Female)
                        </option>
                      </select>

                      {/* Transparent Watermark Emblem of Gender */}
                      <span style={{
                        position: 'absolute',
                        right: '15px',
                        top: '50%',
                        transform: 'translateY(-50%)',
                        fontSize: '1.25rem',
                        opacity: 0.35,
                        pointerEvents: 'none'
                      }}>
                        {partForm.gender === 'female' ? '👩' : '👨'}
                      </span>
                    </div>
                  </div>

                  <div className="form-group" style={{ paddingLeft: '0.75rem', boxSizing: 'border-box' }}>
                    <label className="form-label">ചെസ്റ്റ് നമ്പർ (Chest Number)</label>
                    <input 
                      type="text" 
                      className="form-input"
                      style={{ width: '100%', boxSizing: 'border-box' }}
                      placeholder="Enter Chest No."
                      value={partForm.chestNumber}
                      onChange={(e) => setPartForm({ ...partForm, chestNumber: e.target.value })}
                    />
                  </div>
                </div>

                {partForm.dob && (
                  <div style={{ margin: '1rem 0', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: `1.5px solid ${calculateAgeGroup(partForm.dob) ? 'var(--primary-color)' : '#dc2626'}`, display: 'flex', alignItems: 'center', justifyContent: 'center', flexWrap: 'wrap', gap: '0.75rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '0.9rem' }}>
                      <span>പ്രായ വിഭാഗം (Age Group):</span>
                    </div>
                    <div>
                      {calculateAgeGroup(partForm.dob) ? (
                        <span style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--primary-color)', border: '1.5px solid var(--primary-color)', padding: '4px 14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.92rem' }}>
                          {AGE_GROUPS[calculateAgeGroup(partForm.dob)]}
                        </span>
                      ) : (
                        <span style={{ backgroundColor: '#fee2e2', color: '#dc2626', border: '1.5px solid #fca5a5', padding: '4px 14px', borderRadius: '16px', fontWeight: 'bold', fontSize: '0.92rem' }}>
                          ⚠️ നിർവ്വചിക്കപ്പെട്ട പ്രായ പരിധികളിൽ വരുന്നില്ല!
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {calculateAgeGroup(partForm.dob) && (
                  <div className="registration-section">
                    <h3 style={{ fontSize: '1rem', fontWeight: 'bold', marginBottom: '1rem' }}>മത്സര ഇനങ്ങൾ തിരഞ്ഞെടുക്കുക (Select Items)</h3>
                    
                    {/* Sahithya Section */}
                    {(activeCategory === 'sahithya' || activeCategory === 'both') && (
                      <div style={{ marginBottom: '1.5rem' }}>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                          സാഹിത്യ മത്സരങ്ങൾ (Sahithya Malsaram)
                        </h4>
                        <div className="items-grid">
                          {getAvailableItemsForParticipant(partForm.gender, partForm.dob).sahithya.map(item => (
                            <div 
                              key={item.id} 
                              className={`item-checkbox-card ${partForm.registeredItems.includes(item.id) ? 'selected' : ''}`}
                              onClick={() => handleItemSelect(item.id, 'sahithya', item.type)}
                            >
                              <input type="checkbox" checked={partForm.registeredItems.includes(item.id)} readOnly />
                              <div className="item-details">
                                <span className="item-name-malayalam">{item.nameMal}</span>
                                <span className="item-name-english">{item.nameEng}</span>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* Kalaa Section */}
                    {(activeCategory === 'kalaa' || activeCategory === 'both') && (
                      <div>
                        <h4 style={{ fontSize: '0.9rem', color: 'var(--accent-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                          കലാ മത്സരങ്ങൾ (Kalaa Malsaram)
                        </h4>
                        <div className="items-grid">
                          {getAvailableItemsForParticipant(partForm.gender, partForm.dob).kalaa.map(item => {
                            const isSelected = item.type === 'group' 
                              ? (partForm.registeredGroupItems || []).includes(item.id)
                              : partForm.registeredItems.includes(item.id);

                            return (
                              <div 
                                key={item.id} 
                                className={`item-checkbox-card ${isSelected ? 'selected' : ''}`}
                                onClick={() => handleItemSelect(item.id, 'kalaa', item.type)}
                              >
                                <input type="checkbox" checked={isSelected} readOnly />
                                <div className="item-details">
                                  <span className="item-name-malayalam">{item.nameMal}</span>
                                  <span className="item-name-english">
                                    {item.nameEng} {item.type === 'group' ? '(ഗ്രൂപ്പ് ഇനം)' : ''}
                                  </span>
                                </div>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {/* Live Participant & Gender Confirmation Banner beside Save Button */}
                <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: `2px solid ${partForm.gender === 'female' ? '#ec4899' : '#3b82f6'}` }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                    {/* Gender Avatar Picture */}
                    <div style={{
                      width: '46px',
                      height: '46px',
                      borderRadius: '50%',
                      backgroundColor: partForm.gender === 'female' ? '#fce7f3' : '#dbeafe',
                      border: `2px solid ${partForm.gender === 'female' ? '#ec4899' : '#3b82f6'}`,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      fontSize: '1.65rem',
                      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                    }}>
                      {partForm.gender === 'female' ? '👩' : '👨'}
                    </div>

                    <div>
                      <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                        മത്സരാർത്ഥിയുടെ പ്രൊഫൈൽ വിവരങ്ങൾ (Live Confirmation):
                      </div>
                      <div style={{ fontSize: '0.98rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                        {partForm.name || 'പേര് നൽകിയിട്ടില്ല'} {partForm.houseName ? `(${partForm.houseName})` : ''}
                      </div>
                      <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '2px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '8px' }}>
                        <div style={{ color: partForm.gender === 'female' ? '#be185d' : '#1d4ed8', display: 'flex', alignItems: 'center', gap: '4px' }}>
                          <span>തിരഞ്ഞെടുത്ത ജെൻഡർ:</span>
                          <span style={{ backgroundColor: partForm.gender === 'female' ? '#fbcfe8' : '#bfdbfe', padding: '2px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                            {partForm.gender === 'female' ? '👩 പെൺകുട്ടി (Female)' : '👨 ആൺകുട്ടി (Male)'}
                          </span>
                        </div>

                        {partForm.dob && calculateAgeGroup(partForm.dob) && (
                          <div style={{ color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '4px' }}>
                            <span style={{ color: 'var(--text-muted)' }}>|</span>
                            <span>വിഭാഗം:</span>
                            <span style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--primary-color)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 'bold', border: '1px solid var(--primary-color)' }}>
                              {AGE_GROUPS[calculateAgeGroup(partForm.dob)]}
                            </span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '1rem', fontWeight: 'bold' }}>
                    <Check size={18} /> {editingPartId ? "തിരുത്തലുകൾ സേവ് ചെയ്യുക" : "മത്സരാർത്ഥിയെ സേവ് ചെയ്യുക"}
                  </button>
                </div>
              </form>
            </div>

            {/* Action Bar for Modal Trigger Buttons */}
            <div className="card no-print" style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: '5px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ margin: '0 0 0.25rem 0', fontSize: '1.15rem', color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    രജിസ്റ്റർ ചെയ്ത മത്സരാർത്ഥികളുടെ വിവരങ്ങളും ചെസ്റ്റ് നമ്പറുകളും
                  </h3>
                  <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                    നിലവിൽ <strong>{participants.length}</strong> മത്സരാർത്ഥികൾ സിസ്റ്റത്തിൽ രജിസ്റ്റർ ചെയ്തിട്ടുണ്ട്.
                  </p>
                </div>
                
                <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ padding: '10px 18px', fontSize: '0.95rem' }}
                    onClick={() => setShowParticipantsModal(true)}
                  >
                    <Eye size={18} /> വിവരങ്ങൾ കാണാനും പ്രിന്റ് ചെയ്യാനും (View & Print Participants)
                  </button>

                  <button 
                    type="button" 
                    className="btn"
                    style={{ padding: '10px 18px', fontSize: '0.95rem', backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => setShowGroupPrintModal(true)}
                  >
                    <Award size={18} /> ഗ്രൂപ്പ് ഇനങ്ങൾ പ്രിന്റ് ചെയ്യുക (Print Group Items)
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '0.95rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--text-main)', border: '1px solid var(--border-color)' }}
                    onClick={() => setShowChestManagementModal(true)}
                  >
                    <Hash size={18} /> ചെസ്റ്റ് നമ്പർ ക്രമീകരണങ്ങൾ (Chest Number Management)
                  </button>

                  <button 
                    type="button" 
                    className="btn btn-secondary"
                    style={{ padding: '10px 18px', fontSize: '0.95rem', backgroundColor: 'var(--bg-tertiary)', color: 'var(--primary-color)', border: '1px solid var(--primary-color)' }}
                    onClick={() => setShowMergeModal(true)}
                  >
                    <GitMerge size={18} /> മത്സരാർത്ഥികളെ ലയിപ്പിക്കുക (Merge Participants)
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 3: Enter Winners --- */}
        {activeTab === 'winners-entry' && (
          <div>
            <div className="card no-print">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem', marginBottom: '1.25rem' }}>
                <h2 className="card-title" style={{ margin: 0 }}>വിജയികളെ രേഖപ്പെടുത്തുക (Declare Winner Results)</h2>

                {/* Prominent Edit / Delete Results Button */}
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ 
                    padding: '8px 16px', 
                    fontWeight: 'bold', 
                    fontSize: '0.9rem',
                    backgroundColor: 'var(--bg-tertiary)', 
                    color: 'var(--primary-color)', 
                    border: '1.5px solid var(--primary-color)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '0.5rem',
                    boxShadow: 'var(--shadow-sm)'
                  }}
                  onClick={() => setShowEditResultsModal(true)}
                >
                  <Edit2 size={18} /> ഫലങ്ങൾ തിരുത്തുക / ഇല്ലാതാക്കുക (Edit & Filter Results)
                </button>
              </div>

              {/* Individual vs Group Toggle */}
              <div style={{ display: 'flex', gap: '1rem', marginBottom: '1rem' }}>
                <button 
                  type="button"
                  className={`btn ${winnerEntryType === 'individual' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => setWinnerEntryType('individual')}
                >
                  <Users size={16} /> വ്യക്തിഗത മത്സരങ്ങൾ (Individual Items)
                </button>
                <button 
                  type="button"
                  className={`btn ${winnerEntryType === 'group' ? 'btn-primary' : 'btn-secondary'}`}
                  onClick={() => {
                    setWinnerEntryType('group');
                    setWinnerForm(prev => ({ ...prev, itemType: 'group', itemName: 'k_parichamuttu', parish: '' }));
                  }}
                >
                  <Award size={16} /> ഗ്രൂപ്പ് മത്സരങ്ങൾ (Group Items)
                </button>
              </div>

              {/* Individual Modes */}
              {winnerEntryType === 'individual' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <button 
                    type="button" 
                    className={`btn ${winnerEntryMode === 'chest' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setWinnerEntryMode('chest')}
                  >
                    <Hash size={16} /> ചെസ്റ്റ് നമ്പർ വഴി ചേർക്കുക (Search Chest No)
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${winnerEntryMode === 'select' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setWinnerEntryMode('select')}
                  >
                    <Layers size={16} /> മത്സര ഇനവും ഇടവകയും വഴി ചേർക്കുക (Select Item & Parish)
                  </button>
                </div>
              )}

              {/* Group Modes */}
              {winnerEntryType === 'group' && (
                <div style={{ display: 'flex', gap: '1rem', marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1rem' }}>
                  <button 
                    type="button" 
                    className={`btn ${winnerGroupEntryMode === 'chest' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => {
                      setWinnerGroupEntryMode('chest');
                      setWinnerGroupChestSearch('');
                      setWinnerFoundGroup(null);
                    }}
                  >
                    <Hash size={16} /> ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പർ വഴി ചേർക്കുക (Search Group Chest No)
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${winnerGroupEntryMode === 'select' ? 'btn-primary' : 'btn-secondary'}`}
                    onClick={() => setWinnerGroupEntryMode('select')}
                  >
                    <Layers size={16} /> മത്സര ഇനവും ഇടവകയും വഴി ചേർക്കുക (Select Item & Parish)
                  </button>
                </div>
              )}

              <form onSubmit={handleSaveWinner}>
                {/* Group Item Mode 1: Search Group Chest Number */}
                {winnerEntryType === 'group' && winnerGroupEntryMode === 'chest' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: '1rem', maxWidth: '340px' }}>
                      <label className="form-label">ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പർ നൽകുക *</label>
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ paddingLeft: '32px' }}
                          placeholder="Group Chest No (e.g. 201)..."
                          value={winnerGroupChestSearch}
                          onChange={(e) => {
                            const val = e.target.value.trim();
                            setWinnerGroupChestSearch(val);
                            let found = null;
                            if (val) {
                              const currentGroupChestNumbers = db?.years?.[currentYear]?.groupChestNumbers || {};
                              for (const [itemId, parishMap] of Object.entries(currentGroupChestNumbers)) {
                                for (const [parish, cNum] of Object.entries(parishMap)) {
                                  if (String(cNum).trim() === val) {
                                    const members = participants.filter(p => p.parish === parish && (p.registeredGroupItems || []).includes(itemId));
                                    found = {
                                      itemId,
                                      itemName: getItemDisplayName(itemId),
                                      parish,
                                      chestNumber: cNum,
                                      members
                                    };
                                    break;
                                  }
                                }
                                if (found) break;
                              }
                            }
                            setWinnerFoundGroup(found);
                            if (found) {
                              setWinnerForm(prev => ({
                                ...prev,
                                itemName: found.itemId,
                                itemType: 'group',
                                category: 'kalaa',
                                parish: found.parish,
                                chestNumber: found.chestNumber
                              }));
                            }
                          }}
                        />
                      </div>
                    </div>

                    {winnerFoundGroup ? (
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', border: '1.5px solid #7c3aed' }}>
                        <h4 style={{ color: '#7c3aed', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                          <Award size={18} /> ഗ്രൂപ്പ് ടീമിന്റെ വിവരങ്ങൾ (Group Team Details):
                        </h4>
                        <p style={{ margin: '0 0 0.35rem 0', fontSize: '0.98rem' }}>
                          <strong>മത്സര ഇനം:</strong> <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{winnerFoundGroup.itemName}</span>
                          &nbsp;|&nbsp;
                          <strong>ഇടവക:</strong> <span style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>{winnerFoundGroup.parish}</span>
                          &nbsp;|&nbsp;
                          <strong>ഗ്രൂപ്പ് ചെസ്റ്റ് നം:</strong> <span style={{ color: '#166534', backgroundColor: '#dcfce7', padding: '2px 8px', borderRadius: '4px', fontWeight: 'bold' }}>{winnerFoundGroup.chestNumber}</span>
                        </p>
                        <div style={{ marginTop: '0.5rem' }}>
                          <div style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-muted)', marginBottom: '4px' }}>
                            ടീം അംഗങ്ങൾ ({winnerFoundGroup.members.length} പേർ):
                          </div>
                          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                            {winnerFoundGroup.members.map((m, idx) => (
                              <span key={m.id} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '2px 8px', borderRadius: '4px', fontSize: '0.82rem' }}>
                                {idx + 1}. {m.name}{m.houseName ? ` (${m.houseName})` : ''}
                              </span>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      winnerGroupChestSearch && <p style={{ color: 'red', marginTop: '6px', fontWeight: 'bold' }}>ഈ ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പർ നൽകിയിട്ടുള്ള ഇടവകയെയോ ഇനത്തെയോ കണ്ടെത്താനായില്ല!</p>
                    )}
                  </div>
                )}

                {/* Group Item Mode 2: Select Group Item & Parish */}
                {winnerEntryType === 'group' && winnerGroupEntryMode === 'select' && (
                  <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">ഗ്രൂപ്പ് ഇനം തിരഞ്ഞെടുക്കുക *</label>
                      <select 
                        className="form-select"
                        value={winnerForm.itemName}
                        onChange={(e) => {
                          const val = e.target.value;
                          setWinnerForm(prev => ({ 
                            ...prev, 
                            itemName: val, 
                            itemType: 'group', 
                            category: 'kalaa', 
                            parish: '' // Reset parish selection when group item changes
                          }));
                        }}
                      >
                        <optgroup label="ആൺകുട്ടികൾ">
                          {GROUP_ITEMS.male.map(i => <option key={i.id} value={i.id}>{i.nameMal}</option>)}
                        </optgroup>
                        <optgroup label="പെൺകുട്ടികൾ">
                          {GROUP_ITEMS.female.map(i => <option key={i.id} value={i.id}>{i.nameMal}</option>)}
                        </optgroup>
                        <optgroup label="പൊതുവായത്">
                          {GROUP_ITEMS.common.map(i => <option key={i.id} value={i.id}>{i.nameMal}</option>)}
                        </optgroup>
                      </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">ഈ ഇനത്തിൽ പങ്കെടുത്ത ഇടവക (Registered Parish) *</label>
                      <select 
                        className="form-select"
                        value={winnerForm.parish}
                        onChange={(e) => {
                          const pVal = e.target.value;
                          const currentGroupChest = db?.years?.[currentYear]?.groupChestNumbers?.[winnerForm.itemName]?.[pVal] || "";
                          setWinnerForm(prev => ({ ...prev, parish: pVal, chestNumber: currentGroupChest }));
                        }}
                        required
                      >
                        <option value="">ഇടവക തിരഞ്ഞെടുക്കുക</option>
                        {registeredParishesForGroupItem.map(p => (
                          <option key={p} value={p}>
                            {p} {db?.years?.[currentYear]?.groupChestNumbers?.[winnerForm.itemName]?.[p] ? `(Group Chest: ${db.years[currentYear].groupChestNumbers[winnerForm.itemName][p]})` : ''}
                          </option>
                        ))}
                      </select>
                      {registeredParishesForGroupItem.length === 0 && (
                        <p style={{ color: 'red', fontSize: '0.85rem', marginTop: '4px', fontWeight: 'bold' }}>
                          ⚠️ ശ്രദ്ധിക്കുക: ഈ ഗ്രൂപ്പ് ഇനത്തിൽ ടീം അംഗങ്ങളാരും ഏത് ഇടവകയിൽ നിന്നും ഇതുവരെ രജിസ്റ്റർ ചെയ്തിട്ടില്ല!
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Individual Mode 1: Search Chest Number */}
                {winnerEntryType === 'individual' && winnerEntryMode === 'chest' && (
                  <div style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ marginBottom: '1rem', maxWidth: '320px' }}>
                      <label className="form-label">ചെസ്റ്റ് നമ്പർ നൽകുക *</label>
                      <div style={{ position: 'relative' }}>
                        <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                        <input 
                          type="text" 
                          className="form-input" 
                          style={{ paddingLeft: '32px' }}
                          placeholder="Chest No..."
                          value={winnerChestSearch}
                          onChange={(e) => {
                            const val = e.target.value;
                            setWinnerChestSearch(val);
                            const found = participants.find(p => p.chestNumber === val);
                            setWinnerFoundPart(found || null);
                          }}
                        />
                      </div>
                    </div>

                    {winnerFoundPart ? (
                      <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                        <h4 style={{ color: 'var(--primary-color)', marginBottom: '0.5rem' }}>മത്സരാർത്ഥിയുടെ വിവരങ്ങൾ:</h4>
                        <p style={{ margin: '0 0 0.25rem 0' }}><strong>പേര്:</strong> {winnerFoundPart.name} | <strong>വീട്ടുപേര്:</strong> {winnerFoundPart.houseName}</p>
                        <p style={{ margin: '0 0 0.75rem 0' }}><strong>ഇടവക:</strong> {winnerFoundPart.parish} | <strong>വിഭാഗം:</strong> {AGE_GROUPS[calculateAgeGroup(winnerFoundPart.dob)]}</p>

                        <div className="form-group">
                          <label className="form-label">മത്സര ഇനം തിരഞ്ഞെടുക്കുക *</label>
                          <select 
                            className="form-select"
                            value={winnerForm.itemName}
                            onChange={(e) => {
                              const val = e.target.value;
                              const isSah = val.startsWith('s_');
                              setWinnerForm({
                                ...winnerForm,
                                itemName: val,
                                participantId: winnerFoundPart.id,
                                chestNumber: winnerFoundPart.chestNumber,
                                parish: winnerFoundPart.parish,
                                itemType: 'individual',
                                category: isSah ? 'sahithya' : 'kalaa',
                                ageCategory: calculateAgeGroup(winnerFoundPart.dob)
                              });
                            }}
                            required
                          >
                            <option value="">ഇനം തിരഞ്ഞെടുക്കുക</option>
                            {winnerFoundPart.registeredItems
                              .filter(id => activeCategory === 'both' || (activeCategory === 'sahithya' && id.startsWith('s_')) || (activeCategory === 'kalaa' && id.startsWith('k_')))
                              .map(id => (
                                <option key={id} value={id}>{getItemDisplayName(id)}</option>
                              ))
                            }
                          </select>
                        </div>
                      </div>
                    ) : (
                      winnerChestSearch && <p style={{ color: 'red' }}>ചെസ്റ്റ് നമ്പർ കാണാനില്ല!</p>
                    )}
                  </div>
                )}

                {/* Individual Mode 2 with Age Group & Gender Filters - Clean Synchronized Handlers */}
                {winnerEntryType === 'individual' && winnerEntryMode === 'select' && (
                  <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">മത്സര ഇനം (Competition Item) *</label>
                      <select 
                        className="form-select" 
                        value={winSelItem} 
                        onChange={(e) => {
                          setWinSelItem(e.target.value);
                          setWinSelPartId(""); // Reset participant selection cleanly when item changes
                        }}
                      >
                        {(activeCategory === 'both' || activeCategory === 'sahithya') && (
                          <optgroup label="സാഹിത്യ മത്സരങ്ങൾ (Sahithya Items)">
                            <option value="s_essay">ഉപന്യാസം (Essay)</option>
                            <option value="s_story">ചെറുകഥ (Short Story)</option>
                            <option value="s_poetry">കവിത (Poetry)</option>
                            <option value="s_paint_water">ചിത്ര രചന - ജലച്ചായം (Water Color Painting)</option>
                            <option value="s_paint_pencil">ചിത്ര രചന - പെൻസിൽ (Pencil Drawing)</option>
                          </optgroup>
                        )}
                        {(activeCategory === 'both' || activeCategory === 'kalaa') && (
                          <optgroup label="കലാ മത്സരങ്ങൾ (Kalaa Items)">
                            <option value="k_elocution">പ്രസംഗം (Elocution)</option>
                            <option value="k_music">സംഗീതം (Music)</option>
                            <option value="k_bible_reading">ബൈബിൾ വായന (Bible Reading)</option>
                            <option value="k_dance">നാടോടി നൃത്തം (Folk Dance)</option>
                            <option value="k_quiz">മിഷൻ ക്വിസ് (Mission Quiz)</option>
                            <option value="k_kadhaprasangam">കഥാ പ്രസംഗം (Kadhaprasangam)</option>
                          </optgroup>
                        )}
                      </select>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">ഇടവക (Parish) *</label>
                      <select 
                        className="form-select" 
                        value={winSelParish} 
                        onChange={(e) => {
                          setWinSelParish(e.target.value);
                          setWinSelPartId(""); // Reset participant selection cleanly when parish changes
                        }}
                      >
                        {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    <div className="form-group">
                      <label className="form-label">വിഭാഗം (Age Group) *</label>
                      <select 
                        className="form-select"
                        value={winSelAge}
                        onChange={(e) => {
                          setWinSelAge(e.target.value);
                          setWinSelPartId(""); // Reset participant selection cleanly when age group changes
                        }}
                      >
                        {Object.entries(AGE_GROUPS).map(([k, v]) => (
                          <option key={k} value={k}>{v}</option>
                        ))}
                      </select>
                    </div>

                    <div className="form-group" style={{ position: 'relative' }}>
                      <label className="form-label" style={{ fontWeight: 'bold' }}>ജെൻഡർ (Gender) *</label>
                      <div style={{ position: 'relative', width: '100%', boxSizing: 'border-box' }}>
                        <select 
                          className="form-select"
                          value={winSelGender}
                          style={{
                            backgroundColor: winSelGender === 'female' ? '#fce7f3' : '#dbeafe',
                            color: winSelGender === 'female' ? '#be185d' : '#1d4ed8',
                            borderColor: winSelGender === 'female' ? '#ec4899' : '#3b82f6',
                            fontWeight: 'bold',
                            fontSize: '0.95rem',
                            paddingRight: '2.5rem',
                            width: '100%',
                            boxSizing: 'border-box'
                          }}
                          onChange={(e) => {
                            setWinSelGender(e.target.value);
                            setWinSelPartId(""); // Reset participant selection cleanly when gender changes
                          }}
                        >
                          <option value="male" style={{ backgroundColor: '#dbeafe', color: '#1d4ed8', fontWeight: 'bold' }}>
                            👨 ആൺകുട്ടി (Male)
                          </option>
                          <option value="female" style={{ backgroundColor: '#fce7f3', color: '#be185d', fontWeight: 'bold' }}>
                            👩 പെൺകുട്ടി (Female)
                          </option>
                        </select>

                        {/* Transparent Watermark Emblem of Gender */}
                        <span style={{
                          position: 'absolute',
                          right: '15px',
                          top: '50%',
                          transform: 'translateY(-50%)',
                          fontSize: '1.25rem',
                          opacity: 0.35,
                          pointerEvents: 'none'
                        }}>
                          {winSelGender === 'female' ? '👩' : '👨'}
                        </span>
                      </div>
                    </div>

                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">മത്സരാർത്ഥിയെ തിരഞ്ഞെടുക്കുക *</label>
                      <select 
                        className="form-select"
                        value={winSelPartId}
                        onChange={(e) => {
                          const pId = e.target.value;
                          setWinSelPartId(pId);
                          const p = participants.find(part => part.id === pId);
                          if (p) {
                            const isSah = winSelItem.startsWith('s_');
                            setWinnerForm(prev => ({
                              ...prev,
                              participantId: p.id,
                              chestNumber: p.chestNumber || "",
                              parish: p.parish,
                              itemName: winSelItem,
                              itemType: 'individual',
                              category: isSah ? 'sahithya' : 'kalaa',
                              ageCategory: calculateAgeGroup(p.dob) || winSelAge,
                              gender: p.gender
                            }));
                          } else {
                            setWinnerForm(prev => ({
                              ...prev,
                              participantId: "",
                              chestNumber: ""
                            }));
                          }
                        }}
                      >
                        <option value="">മത്സരാർത്ഥിയെ തിരഞ്ഞെടുക്കുക</option>
                        {participants
                          .filter(p => 
                            p.parish === winSelParish && 
                            calculateAgeGroup(p.dob) === winSelAge && 
                            p.gender === winSelGender && 
                            p.registeredItems.includes(winSelItem)
                          )
                          .map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.houseName}) - Chest: {p.chestNumber || '-'}</option>
                          ))
                        }
                      </select>
                    </div>
                  </div>
                )}

                {/* Positions & Grade */}
                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">സ്ഥാനം (Position)</label>
                    <select className="form-select" value={winnerForm.position} onChange={(e) => setWinnerForm({ ...winnerForm, position: e.target.value })}>
                      <option value="1">1st Place (ഒന്നാം സ്ഥാനം)</option>
                      <option value="2">2nd Place (രണ്ടാം സ്ഥാനം)</option>
                      <option value="3">3rd Place (മൂന്നാം സ്ഥാനം)</option>
                      <option value="">None (സ്ഥാനമില്ല)</option>
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ലഭിച്ച ഗ്രേഡ് (Grade)</label>
                    <select className="form-select" value={winnerForm.grade} onChange={(e) => setWinnerForm({ ...winnerForm, grade: e.target.value })}>
                      <option value="A">A Grade</option>
                      <option value="B">B Grade</option>
                      <option value="C">C Grade</option>
                      <option value="">No Grade</option>
                    </select>
                  </div>
                </div>

                {/* Live Result Confirmation Banner beside Save Result Button */}
                {/* Live Result Confirmation Banner — bannerGender reacts immediately to gender dropdown */}
                {(() => {
                  const bannerGender =
                    winnerEntryType === 'individual' && winnerEntryMode === 'select'
                      ? winSelGender
                      : winnerEntryType === 'individual' && winnerEntryMode === 'chest' && winnerFoundPart
                        ? winnerFoundPart.gender
                        : winnerForm.gender;
                  return (
                    <div style={{ marginTop: '1.5rem', display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: '1rem', padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: `2px solid ${bannerGender === 'female' ? '#ec4899' : '#3b82f6'}` }}>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.85rem' }}>
                        {/* Gender Avatar */}
                        <div style={{
                          width: '46px',
                          height: '46px',
                          borderRadius: '50%',
                          backgroundColor: bannerGender === 'female' ? '#fce7f3' : '#dbeafe',
                          border: `2px solid ${bannerGender === 'female' ? '#ec4899' : '#3b82f6'}`,
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          fontSize: '1.65rem',
                          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                          flexShrink: 0
                        }}>
                          {bannerGender === 'female' ? '👩' : '👨'}
                        </div>

                        <div>
                          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '0.5px', color: 'var(--text-muted)' }}>
                            ഫലം സ്ഥിരീകരണം (Live Confirmation):
                          </div>
                          <div style={{ fontSize: '0.98rem', fontWeight: 'bold', color: 'var(--text-main)' }}>
                            {winnerEntryType === 'group'
                              ? 'ഗ്രൂപ്പ് ടീം'
                              : winnerEntryMode === 'chest'
                                ? (winnerFoundPart ? `${winnerFoundPart.name} (${winnerFoundPart.houseName})` : 'മത്സരാർത്ഥി കാണാനില്ല')
                                : (winSelPartId ? (() => { const p = participants.find(x => x.id === winSelPartId); return p ? `${p.name} (${p.houseName})` : 'മത്സരാർത്ഥി തിരഞ്ഞെടുക്കുക'; })() : 'മത്സരാർത്ഥി തിരഞ്ഞെടുക്കുക')
                            }
                          </div>
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', marginTop: '3px', display: 'flex', alignItems: 'center', flexWrap: 'wrap', gap: '6px' }}>
                            {/* Gender badge */}
                            <span style={{ backgroundColor: bannerGender === 'female' ? '#fbcfe8' : '#bfdbfe', color: bannerGender === 'female' ? '#be185d' : '#1d4ed8', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold' }}>
                              {bannerGender === 'female' ? '👩 പെൺകുട്ടി' : '👨 ആൺകുട്ടി'}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>|</span>
                            {/* Item badge */}
                            <span style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--accent-color)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--accent-color)' }}>
                              {getItemDisplayName(winnerForm.itemName) || '-'}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>|</span>
                            {/* Age Category badge */}
                            <span style={{ backgroundColor: 'var(--bg-primary)', color: 'var(--primary-color)', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid var(--primary-color)' }}>
                              {AGE_GROUPS[winnerForm.ageCategory] || winnerForm.ageCategory || '-'}
                            </span>
                            <span style={{ color: 'var(--text-muted)' }}>|</span>
                            {/* Position badge */}
                            <span style={{ backgroundColor: winnerForm.position ? '#fef9c3' : 'var(--bg-primary)', color: '#92400e', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #fcd34d' }}>
                              {winnerForm.position === '1' ? '🥇 1st' : winnerForm.position === '2' ? '🥈 2nd' : winnerForm.position === '3' ? '🥉 3rd' : '-'}
                            </span>
                            {/* Grade badge */}
                            {winnerForm.grade && (
                              <span style={{ backgroundColor: '#f0fdf4', color: '#166534', padding: '2px 10px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold', border: '1px solid #86efac' }}>
                                {winnerForm.grade} Grade
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      <button type="submit" className="btn btn-primary" style={{ padding: '10px 24px', fontSize: '1rem', fontWeight: 'bold', flexShrink: 0 }}>
                        <Check size={18} /> ഫലം രേഖപ്പെടുത്തുക (Save Result)
                      </button>
                    </div>
                  );
                })()}

              </form>
            </div>

            {/* Declared Results Table with Direct Action Button */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h2 className="card-title" style={{ margin: 0 }}>പ്രഖ്യാപിച്ച ഫലങ്ങളുടെ പട്ടിക (Declared Results)</h2>
                
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ padding: '6px 14px', fontSize: '0.85rem', fontWeight: 'bold' }}
                  onClick={() => setShowEditResultsModal(true)}
                >
                  <Edit2 size={15} /> ഫലങ്ങൾ ഫിൽട്ടർ ചെയ്ത് തിരുത്തുക (Filter & Edit)
                </button>
              </div>

              <div className="table-container">
                <table className="cml-table">
                  <thead>
                    <tr>
                      <th>മത്സര ഇനം (Item)</th>
                      <th>പ്രായ വിഭാഗം (Category)</th>
                      <th>ജെൻഡർ (Gender)</th>
                      <th style={{ textAlign: 'center' }}>സ്ഥാനം</th>
                      <th style={{ textAlign: 'center' }}>ഗ്രേഡ്</th>
                      <th>വിജയി (പേര് & വീട്ടുപേര്)</th>
                      <th>ഇടവക (Parish)</th>
                      <th className="no-print" style={{ textAlign: 'center' }}>നടപടികൾ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {results.map(r => {
                      const p = participants.find(part => part.id === r.participantId);
                      const catKey = r.ageCategory || (p && p.dob ? calculateAgeGroup(p.dob) : '');
                      const catLabel = AGE_GROUPS[catKey] || catKey || '-';
                      const genderVal = r.gender || (p ? p.gender : '');
                      const genderLabel = (genderVal || '').toLowerCase() === 'male' ? 'ആൺകുട്ടികൾ' : (genderVal || '').toLowerCase() === 'female' ? 'പെൺകുട്ടികൾ' : '-';

                      return (
                        <tr key={r.id}>
                          <td><strong>{getItemDisplayName(r.itemName)}</strong></td>
                          <td>{catLabel}</td>
                          <td>{genderLabel}</td>
                          <td style={{ textAlign: 'center' }}><strong>{r.position || '-'}</strong></td>
                          <td style={{ textAlign: 'center' }}>{r.grade || '-'}</td>
                          <td>
                            {p ? `${p.name}${p.houseName ? ` (${p.houseName})` : ''} ${p.chestNumber ? '[' + p.chestNumber + ']' : ''}` : 'ഗ്രൂപ്പ് ടീം'}
                          </td>
                          <td>{r.parish}</td>
                          <td className="no-print" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button className="btn btn-secondary" style={{ padding: '2px 6px' }} onClick={() => setEditResultModal({ show: true, result: { ...r } })}>
                                <Edit2 size={14} /> തിരുത്തുക
                              </button>
                              <button className="btn btn-danger" style={{ padding: '2px 6px' }} onClick={() => handleDeleteResult(r.id)}>
                                <Trash2 size={14} />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {results.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>ഫലങ്ങളൊന്നും രേഖപ്പെടുത്തിയിട്ടില്ല.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 4: SIMPLIFIED RESULTS VIEW PAGE WITH DEDICATED VIEW & PRINT RESULT ACTION BUTTON --- */}
        {activeTab === 'results-view' && (
          <div>
            <div className="card no-print" style={{ backgroundColor: 'var(--bg-secondary)', borderLeft: '5px solid var(--gold-color)', padding: '1.5rem' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1.5rem' }}>
                <div>
                  <h2 style={{ margin: '0 0 0.5rem 0', fontSize: '1.35rem', color: 'var(--gold-color)', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <FileText size={24} /> ചെറുപുഷ്പ മിഷൻ ലീഗ് മത്സരഫലങ്ങൾ (Results View & Reports)
                  </h2>
                  <p style={{ margin: 0, fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                    വിഭാഗങ്ങളും പ്രായപരിധികളും തിരിച്ച് മത്സരഫലങ്ങൾ പരിശോധിക്കുന്നതിനും പ്രിന്റ് എടുക്കുന്നതിനും താഴെയുള്ള ബട്ടൺ ഉപയോഗിക്കുക.
                  </p>
                </div>

                {/* Main Prominent "View & Print Result" Action Button */}
                <div style={{ display: 'flex', gap: '12px', flexWrap: 'wrap' }}>
                  <button 
                    type="button" 
                    className="btn btn-primary"
                    style={{ padding: '12px 24px', fontSize: '1.05rem', fontWeight: 'bold', backgroundColor: 'var(--gold-color)', color: '#ffffff', boxShadow: 'var(--shadow-md)' }}
                    onClick={() => setShowResultsModal(true)}
                  >
                    <Printer size={20} /> ഫലങ്ങൾ കാണാനും പ്രിന്റ് ചെയ്യാനും (View & Print Result)
                  </button>

                  <button 
                    type="button" 
                    className="btn"
                    style={{ padding: '12px 24px', fontSize: '1.05rem', fontWeight: 'bold', backgroundColor: '#7c3aed', color: '#ffffff', boxShadow: 'var(--shadow-md)', display: 'flex', alignItems: 'center', gap: '8px' }}
                    onClick={() => setShowRupathaModal(true)}
                  >
                    <Trophy size={20} style={{ color: '#fef08a' }} /> രൂപത മത്സരം (Rupatha Competition)
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Leaderboard Standings Summary Card */}
            <div className="card">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1rem', flexWrap: 'wrap', gap: '0.5rem' }}>
                <h3 className="card-title" style={{ margin: 0 }}>ഇടവക ലീഡർബോർഡ് സംഗ്രഹം (Leaderboard Overview)</h3>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button
                    type="button"
                    className="btn btn-secondary no-print"
                    style={{ padding: '7px 16px', fontSize: '0.88rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                    onClick={() => handlePrintLeaderboard('print')}
                  >
                    <Printer size={15} /> Print Leaderboard
                  </button>

                </div>
              </div>
              <div className="table-container">
                <table className="cml-table">
                  <thead>
                    <tr>
                      <th>റാങ്ക്</th>
                      <th>ഇടവക / യൂണിറ്റ്</th>
                      <th>സാഹിത്യം</th>
                      <th>കല</th>
                      <th>ആകെ പോയിന്റ്</th>
                    </tr>
                  </thead>
                  <tbody>
                    {standings.map((st) => {
                      const isTop3 = typeof st.rank === 'number' && st.rank <= 3;
                      const pillClass = isTop3 ? `rank-pill-${st.rank}` : '';
                      const medal = st.rank === 1 ? '🥇 ' : st.rank === 2 ? '🥈 ' : st.rank === 3 ? '🥉 ' : '';

                      return (
                        <tr key={st.parish}>
                          <td><span className={pillClass}>{medal}{st.rank}</span></td>
                          <td><strong>{st.parish}</strong></td>
                          <td>{st.sahithya}</td>
                          <td>{st.kalaa}</td>
                          <td><strong style={{ fontSize: '1.1rem', color: 'var(--accent-color)' }}>{st.total}</strong></td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* --- Tab 5: Settings --- */}
        {activeTab === 'settings' && (
          <div className="card">
            <h2 className="card-title">സിസ്റ്റം ക്രമീകരണങ്ങൾ (Settings Panel)</h2>
            {/* Supabase Cloud Backend Config */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', padding: '1.25rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', borderLeft: `5px solid ${cloudStatus === 'connected' ? '#16a34a' : '#d97706'}` }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', margin: '0 0 0.5rem 0', color: 'var(--primary-color)' }}>
                Supabase Cloud Backend ({cloudStatus === 'connected' ? 'Connected ✓' : cloudStatus === 'error' ? 'Sync Error' : 'Local Only'})
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: '0 0 0.75rem 0' }}>
                നിങ്ങളുടെ Supabase Project URL ഉം Anon Key ഉം ഇവിടെ നൽകി സേവ് ചെയ്താൽ എല്ലാ ഡാറ്റയും ഓൺലൈൻ വഴി എവിടെ നിന്നും ആക്‌സസ് ചെയ്യാം.
              </p>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Supabase Project URL</label>
                  <input type="text" className="form-input" placeholder="https://your-project.supabase.co" value={supabaseUrlInput} onChange={(e) => setSupabaseUrlInput(e.target.value)} />
                </div>
                <div className="form-group">
                  <label className="form-label">Supabase Anon Public Key</label>
                  <input type="password" className="form-input" placeholder="eyJ..." value={supabaseKeyInput} onChange={(e) => setSupabaseKeyInput(e.target.value)} />
                </div>
              </div>
              <div style={{ display: 'flex', gap: '0.75rem', flexWrap: 'wrap' }}>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={async () => {
                    localStorage.setItem('cml_supabase_url', supabaseUrlInput.trim());
                    localStorage.setItem('cml_supabase_key', supabaseKeyInput.trim());
                    if (supabaseUrlInput.trim() && supabaseKeyInput.trim()) {
                      try {
                        const remote = await loadDbFromSupabase();
                        if (remote && remote.years) {
                          setDb(remote);
                          localStorage.setItem('cml_db', JSON.stringify(remote));
                        } else if (db) {
                          await saveDbToSupabase(db);
                        }
                        setCloudStatus('connected');
                        showToast('Supabase Cloud കണക്റ്റ് ചെയ്ത് സിങ്ക് ചെയ്തു!', 'success');
                      } catch (err) {
                        setCloudStatus('error');
                        showToast('Supabase കണക്ഷൻ പിശക്: ' + err.message, 'error');
                      }
                    } else {
                      setCloudStatus('local');
                      showToast('ലോക്കൽ സ്റ്റോറേജ് മോഡിലേക്ക് മാറ്റി.', 'info');
                    }
                  }}
                >
                  Connect &amp; Sync Supabase
                </button>
                <button type="button" className="btn btn-secondary" onClick={handlePushToCloud}>
                  <Upload size={15} /> Push This Device Data to Cloud
                </button>
                <button type="button" className="btn btn-secondary" onClick={handleSyncFromCloud}>
                  <RefreshCw size={15} /> Pull Latest Data from Cloud
                </button>
              </div>
            </div>
            {/* Master ID Registry Launch Section (Clean Action Button) */}
            <div style={{ marginBottom: '1.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '5px solid var(--primary-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 0.35rem 0', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <Key size={20} /> ചെറുപുഷ്പ മിഷൻ ലീഗ് മാസ്റ്റർ ഐഡി പട്ടിക (Master Participant IDs)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    സിസ്റ്റത്തിൽ രജിസ്റ്റർ ചെയ്തിട്ടുള്ള എല്ലാ മത്സരാർത്ഥികളുടെയും മാസ്റ്റർ ഐഡികൾ പരിശോധിക്കാൻ താഴെയുള്ള ബട്ടൺ അമർത്തുക.
                  </p>
                </div>

                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ padding: '10px 20px', fontSize: '0.95rem', fontWeight: 'bold' }}
                  onClick={() => setShowMasterIdModal(true)}
                >
                  <Key size={18} />ത്സരാർത്ഥികളുടെ മാസ്റ്റർ ഐഡി (Participants Master ID)
                </button>
              </div>
            </div>

            {/* Merge Participants Action Section in Settings */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)', padding: '1.25rem', borderRadius: 'var(--radius-md)', borderLeft: '5px solid var(--accent-color)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
                <div>
                  <h3 style={{ fontSize: '1.15rem', fontWeight: 'bold', margin: '0 0 0.35rem 0', color: 'var(--accent-color)', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <GitMerge size={20} /> ഡൂപ്ലിക്കേറ്റ് മത്സരാർത്ഥികളെ ലയിപ്പിക്കുക (Merge Participants)
                  </h3>
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    പേരിൽ അക്ഷരത്തെറ്റ് മൂലം ഉണ്ടാകുന്ന ഡൂപ്ലിക്കേറ്റ് പ്രൊഫൈലുകൾ ലയിപ്പിച്ച് പോയിന്റുകളും ഇനങ്ങളും ഒന്നിപ്പിക്കുക.
                  </p>
                </div>

                <button 
                  type="button" 
                  className="btn btn-secondary"
                  style={{ padding: '10px 20px', fontSize: '0.95rem', fontWeight: 'bold', backgroundColor: 'var(--bg-tertiary)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)' }}
                  onClick={() => setShowMergeModal(true)}
                >
                  <GitMerge size={18} /> മത്സരാർത്ഥികളെ ലയിപ്പിക്കുക (Merge Tool)
                </button>
              </div>
            </div>

            {/* Create New Competition Year Section */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                പുതിയ മത്സര വർഷം ചേർക്കുക (Add New Competition Year)
              </h3>
              <div style={{ display: 'flex', gap: '1rem', alignItems: 'flex-end', maxWidth: '500px' }}>
                <div className="form-group" style={{ flex: 1 }}>
                  <label className="form-label">വർഷം (Year)</label>
                  <input 
                    type="number" 
                    className="form-input" 
                    placeholder="E.g., 2027" 
                    min="2020" 
                    max="2099"
                    value={newYearInputVal}
                    onChange={(e) => setNewYearInputVal(e.target.value)}
                  />
                </div>
                <button 
                  type="button"
                  className="btn btn-primary"
                  onClick={() => handleAddNewYear(newYearInputVal)}
                >
                  <Plus size={16} /> പുതിയ വർഷം നിർമ്മിക്കുക
                </button>
              </div>
            </div>

            {/* Age Limits Form */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                പ്രായ പരിധി തിട്ടപ്പെടുത്തുക (DOB Ranges - {currentYear})
              </h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {Object.entries(ageCategoryRules).map(([catKey, range]) => (
                  <div key={catKey} style={{ display: 'grid', gridTemplateColumns: '2fr 3fr 3fr', gap: '1rem', alignItems: 'center' }}>
                    <div style={{ fontWeight: '600' }}>{AGE_GROUPS[catKey]}</div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>ആരംഭ തീയതി</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={range.start} 
                        onChange={(e) => {
                          const updated = { ...ageCategoryRules };
                          updated[catKey].start = e.target.value;
                          const updatedDb = JSON.parse(JSON.stringify(db));
                          updatedDb.years[currentYear].ageCategoryRules = updated;
                          saveDb(updatedDb);
                        }}
                      />
                    </div>
                    <div className="form-group">
                      <label className="form-label" style={{ fontSize: '0.75rem' }}>അവസാന തീയതി</label>
                      <input 
                        type="date" 
                        className="form-input" 
                        value={range.end} 
                        onChange={(e) => {
                          const updated = { ...ageCategoryRules };
                          updated[catKey].end = e.target.value;
                          const updatedDb = JSON.parse(JSON.stringify(db));
                          updatedDb.years[currentYear].ageCategoryRules = updated;
                          saveDb(updatedDb);
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Database Backup & Restore Section */}
            <div style={{ marginBottom: '2rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '1.5rem' }}>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'var(--primary-color)' }}>
                ഡാറ്റാബേസ് ബാക്കപ്പും റീസ്റ്റോറും (Database Backup & Restore)
              </h3>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                മത്സര വിവരങ്ങളുടെ സുരക്ഷിതമായ സൂക്ഷിപ്പിനായി നിങ്ങളുടെ കമ്പ്യൂട്ടറിലേക്ക് ബാക്കപ്പ് ഫയൽ സൂക്ഷിക്കുകയോ, ബാക്കപ്പ് തിരികെ റീസ്റ്റോർ ചെയ്യുകയോ ചെയ്യാവുന്നതാണ്.
              </p>
              <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  onClick={handleBackupDatabase}
                >
                  <Download size={16} /> ഡാറ്റാബേസ് ബാക്കപ്പ് എടുക്കുക (Export Backup)
                </button>
                <button 
                  type="button" 
                  className="btn btn-secondary"
                  onClick={handleRestoreDatabase}
                >
                  <Upload size={16} /> ഡാറ്റാബേസ് റീസ്റ്റോർ ചെയ്യുക (Import Restore)
                </button>
                <button 
                  type="button" 
                  className="btn btn-primary"
                  style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: '#fff' }}
                  onClick={handleMergeExternalFile}
                >
                  <GitMerge size={16} /> ഫയൽ കൂട്ടിച്ചേർക്കുക (Merge External DB)
                </button>
              </div>
            </div>

            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 'bold', marginBottom: '1rem', color: 'red' }}>
                ഡാറ്റാബേസ് പൂർണ്ണമായും റീസെറ്റ് ചെയ്യുക
              </h3>
              <button 
                type="button"
                className="btn btn-danger"
                onClick={() => setConfirmResetDbModal(true)}
              >
                <Trash2 size={16} /> ഡാറ്റാബേസ് റീസെറ്റ് ചെയ്യുക
              </button>
            </div>
          </div>
        )}
      </main>

      {/* --- MODAL 1: VIEW AND PRINT REGISTERED PARTICIPANTS ROSTER --- */}
      {showParticipantsModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className={`modal-content ${isParticipantsMaximized ? 'maximized' : ''}`} style={isParticipantsMaximized ? {} : { maxWidth: '1150px', width: '95vw', maxHeight: '90vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Users size={20} style={{ color: 'var(--primary-color)' }} />
                <span>രജിസ്റ്റർ ചെയ്ത മത്സരാർത്ഥികൾ (Registered Participants)</span>
              </div>
              
              {/* Desktop Titlebar Controls */}
              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn" 
                  title={isParticipantsMaximized ? "Restore Window (കുറയ്ക്കുക)" : "Maximize Window (വലുതാക്കുക)"}
                  onClick={() => setIsParticipantsMaximized(!isParticipantsMaximized)}
                >
                  {isParticipantsMaximized ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                      <path d="M1.5 3.5V10.5H8.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="0.5" />
                    </svg>
                  )}
                </button>
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  title="Close Window (അടയ്ക്കുക)"
                  onClick={() => setShowParticipantsModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Operational Switcher & Exclusive Competition Category Toggle */}
            <div className="no-print" style={{ margin: '1rem 1rem 0 1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
              {/* 1. Main Print Mode Switcher (Simple vs Multi-Select) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>പ്രിന്റ് മോഡ്:</span>
                <button 
                  type="button" 
                  className={`btn ${partFilterMode === 'simple' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 12px', fontSize: '0.82rem', fontWeight: 'bold' }}
                  onClick={() => {
                    setPartFilterMode('simple');
                    setActivePopover(null);
                  }}
                >
                  സാധാരണ പ്രിന്റ് (Single Select)
                </button>
                <button 
                  type="button" 
                  className={`btn ${partFilterMode === 'multi' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 12px', fontSize: '0.82rem', fontWeight: 'bold' }}
                  onClick={() => {
                    setPartFilterMode('multi');
                    setActivePopover(null);
                  }}
                >
                  മൾട്ടി സെലക്ഷൻ പ്രിന്റ് (Multi-Select)
                </button>
              </div>

              {/* 2. Exclusive Competition Category Switcher (Available in BOTH Simple & Multi modes!) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--primary-color)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>മത്സര തരം:</span>
                <button 
                  type="button" 
                  className={`btn ${partModalCategoryMode === 'sahithya' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                  onClick={() => {
                    setPartModalCategoryMode('sahithya');
                    setPartItemFilter('');
                    setPartSelectedItems([]);
                  }}
                >
                  സാഹിത്യം
                </button>
                <button 
                  type="button" 
                  className={`btn ${partModalCategoryMode === 'kalaa' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                  onClick={() => {
                    setPartModalCategoryMode('kalaa');
                    setPartItemFilter('');
                    setPartSelectedItems([]);
                  }}
                >
                  കല
                </button>
                <button 
                  type="button" 
                  className={`btn ${partModalCategoryMode === 'both' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                  onClick={() => {
                    setPartModalCategoryMode('both');
                    setPartItemFilter('');
                    setPartSelectedItems([]);
                  }}
                >
                  രണ്ടും (Both)
                </button>
              </div>
            </div>

            {/* Filter Bar inside Modal */}
            <div className="results-filter-bar no-print" style={{ margin: '0.5rem 1rem 0.5rem 1rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              {/* Horizontal Row-Filling Grid for Filter/Sorting Boxes */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(4, minmax(0, 1fr))', gap: '12px', alignItems: 'end', marginBottom: '14px' }}>
                {/* Search - Row 1, Col 1 */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>തിരച്ചിൽ (Search)</label>
                  <div style={{ position: 'relative' }}>
                    <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                    <input 
                      type="text" 
                      className="form-input" 
                      style={{ paddingLeft: '32px', width: '100%' }}
                      placeholder="Name, House, Chest..."
                      value={partSearch}
                      onChange={(e) => setPartSearch(e.target.value)}
                    />
                  </div>
                </div>

                {/* Dynamic Filter Controls: Simple Mode vs Multi-Select Mode */}
                {partFilterMode === 'simple' ? (
                  <>
                    {/* Parish - Row 1, Col 2 */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>യൂണിറ്റ് / ഇടവക</label>
                      <select className="form-select" value={partParishFilter} onChange={(e) => setPartParishFilter(e.target.value)}>
                        <option value="">എല്ലാ ഇടവകകളും (All Parishes)</option>
                        {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                      </select>
                    </div>

                    {/* Category - Row 1, Col 3 */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>വിഭാഗം (Category)</label>
                      <select className="form-select" value={partCategoryFilter} onChange={(e) => setPartCategoryFilter(e.target.value)}>
                        <option value="">എല്ലാ വിഭാഗങ്ങളും (All Categories)</option>
                        {Object.entries(AGE_GROUPS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                      </select>
                    </div>

                    {/* Item - Row 1, Col 4 */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                        മത്സര ഇനം ({partModalCategoryMode === 'sahithya' ? 'Sahithya' : partModalCategoryMode === 'kalaa' ? 'Kalaa' : 'All'})
                      </label>
                      <select className="form-select" value={partItemFilter} onChange={(e) => setPartItemFilter(e.target.value)}>
                        <option value="">
                          {partModalCategoryMode === 'sahithya' ? 'എല്ലാ സാഹിത്യ മത്സരങ്ങളും' : partModalCategoryMode === 'kalaa' ? 'എല്ലാ കലാ മത്സരങ്ങളും' : 'എല്ലാ മത്സരങ്ങളും (All)'}
                        </option>
                        {itemsForPartModalDropdown.map(item => (
                          <option key={item.id} value={item.id}>{item.name}</option>
                        ))}
                      </select>
                    </div>

                    {/* Gender - Row 2, Col 1 */}
                    <div className="form-group" style={{ margin: 0 }}>
                      <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>ജെൻഡർ (Gender)</label>
                      <select className="form-select" value={partGenderFilter} onChange={(e) => setPartGenderFilter(e.target.value)}>
                        <option value="">എല്ലാ ജെൻഡറുകളും (All Genders)</option>
                        <option value="male">ആൺകുട്ടികൾ (Male)</option>
                        <option value="female">പെൺകുട്ടികൾ (Female)</option>
                      </select>
                    </div>
                  </>
                ) : (
                  <>
                    {/* Multi-Select Parish - Row 1, Col 2 */}
                    {(() => {
                      const options = PARISHES.map(p => ({ id: p, name: p }));
                      const isOpen = activePopover === 'parish';
                      const isAll = partSelectedParishes.length === 0;
                      return (
                        <div className="form-group" style={{ position: 'relative', margin: 0 }}>
                          <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>ഇടവക (Multi-Select)</label>
                          <button
                            type="button"
                            className="form-select"
                            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}
                            onClick={() => setActivePopover(isOpen ? null : 'parish')}
                          >
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {isAll ? 'എല്ലാ ഇടവകകളും' : (partSelectedParishes.length === 1 ? partSelectedParishes[0] : `${partSelectedParishes.length} ഇടവകകൾ`)}
                            </span>
                            <ChevronDown size={14} />
                          </button>
                          {isOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1005, maxHeight: '230px', overflowY: 'auto', padding: '6px', marginTop: '2px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                                <input type="checkbox" checked={isAll} onChange={() => setPartSelectedParishes([])} />
                                <span>[✓] എല്ലാ ഇടവകകളും (All)</span>
                              </label>
                              {options.map(opt => (
                                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={partSelectedParishes.includes(opt.id)} 
                                    onChange={() => {
                                      if (partSelectedParishes.includes(opt.id)) {
                                        setPartSelectedParishes(partSelectedParishes.filter(x => x !== opt.id));
                                      } else {
                                        setPartSelectedParishes([...partSelectedParishes, opt.id]);
                                      }
                                    }} 
                                  />
                                  <span>{opt.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Multi-Select Category - Row 1, Col 3 */}
                    {(() => {
                      const options = Object.entries(AGE_GROUPS).map(([k, v]) => ({ id: k, name: v }));
                      const isOpen = activePopover === 'category';
                      const isAll = partSelectedCategories.length === 0;
                      return (
                        <div className="form-group" style={{ position: 'relative', margin: 0 }}>
                          <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>വിഭാഗം (Multi-Select)</label>
                          <button
                            type="button"
                            className="form-select"
                            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}
                            onClick={() => setActivePopover(isOpen ? null : 'category')}
                          >
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {isAll ? 'എല്ലാ വിഭാഗങ്ങളും' : (partSelectedCategories.length === 1 ? AGE_GROUPS_SHORT_ENG[partSelectedCategories[0]] : `${partSelectedCategories.length} വിഭാഗങ്ങൾ`)}
                            </span>
                            <ChevronDown size={14} />
                          </button>
                          {isOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1005, maxHeight: '230px', overflowY: 'auto', padding: '6px', marginTop: '2px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                                <input type="checkbox" checked={isAll} onChange={() => setPartSelectedCategories([])} />
                                <span>[✓] എല്ലാ വിഭാഗങ്ങളും (All)</span>
                              </label>
                              {options.map(opt => (
                                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={partSelectedCategories.includes(opt.id)} 
                                    onChange={() => {
                                      if (partSelectedCategories.includes(opt.id)) {
                                        setPartSelectedCategories(partSelectedCategories.filter(x => x !== opt.id));
                                      } else {
                                        setPartSelectedCategories([...partSelectedCategories, opt.id]);
                                      }
                                    }} 
                                  />
                                  <span>{opt.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Multi-Select Items - Row 1, Col 4 */}
                    {(() => {
                      const isOpen = activePopover === 'item';
                      const isAll = partSelectedItems.length === 0;
                      return (
                        <div className="form-group" style={{ position: 'relative', margin: 0 }}>
                          <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>
                            മത്സര ഇനം ({partModalCategoryMode === 'sahithya' ? 'Sahithya' : partModalCategoryMode === 'kalaa' ? 'Kalaa' : 'All'})
                          </label>
                          <button
                            type="button"
                            className="form-select"
                            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}
                            onClick={() => setActivePopover(isOpen ? null : 'item')}
                          >
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {isAll ? (partModalCategoryMode === 'sahithya' ? 'എല്ലാ സാഹിത്യ മത്സരങ്ങളും' : partModalCategoryMode === 'kalaa' ? 'എല്ലാ കലാ മത്സരങ്ങളും' : 'എല്ലാ മത്സരങ്ങളും') : (partSelectedItems.length === 1 ? getItemDisplayName(partSelectedItems[0]) : `${partSelectedItems.length} ഇനങ്ങൾ`)}
                            </span>
                            <ChevronDown size={14} />
                          </button>
                          {isOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1005, maxHeight: '230px', overflowY: 'auto', padding: '6px', marginTop: '2px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                                <input type="checkbox" checked={isAll} onChange={() => setPartSelectedItems([])} />
                                <span>[✓] എല്ലാ ഇനങ്ങളും (All)</span>
                              </label>
                              {itemsForPartModalDropdown.map(opt => (
                                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={partSelectedItems.includes(opt.id)} 
                                    onChange={() => {
                                      if (partSelectedItems.includes(opt.id)) {
                                        setPartSelectedItems(partSelectedItems.filter(x => x !== opt.id));
                                      } else {
                                        setPartSelectedItems([...partSelectedItems, opt.id]);
                                      }
                                    }} 
                                  />
                                  <span>{opt.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}

                    {/* Multi-Select Gender - Row 2, Col 1 */}
                    {(() => {
                      const options = [{ id: 'male', name: 'ആൺകുട്ടികൾ (Male)' }, { id: 'female', name: 'പെൺകുട്ടികൾ (Female)' }];
                      const isOpen = activePopover === 'gender';
                      const isAll = partSelectedGenders.length === 0;
                      return (
                        <div className="form-group" style={{ position: 'relative', margin: 0 }}>
                          <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>ജെൻഡർ (Multi-Select)</label>
                          <button
                            type="button"
                            className="form-select"
                            style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}
                            onClick={() => setActivePopover(isOpen ? null : 'gender')}
                          >
                            <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                              {isAll ? 'എല്ലാ ജെൻഡറുകളും' : (partSelectedGenders.length === 1 ? (partSelectedGenders[0] === 'male' ? 'Male' : 'Female') : `${partSelectedGenders.length} ജെൻഡറുകൾ`)}
                            </span>
                            <ChevronDown size={14} />
                          </button>
                          {isOpen && (
                            <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1005, maxHeight: '230px', overflowY: 'auto', padding: '6px', marginTop: '2px' }}>
                              <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                                <input type="checkbox" checked={isAll} onChange={() => setPartSelectedGenders([])} />
                                <span>[✓] എല്ലാ ജെൻഡറുകളും (All)</span>
                              </label>
                              {options.map(opt => (
                                <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                                  <input 
                                    type="checkbox" 
                                    checked={partSelectedGenders.includes(opt.id)} 
                                    onChange={() => {
                                      if (partSelectedGenders.includes(opt.id)) {
                                        setPartSelectedGenders(partSelectedGenders.filter(x => x !== opt.id));
                                      } else {
                                        setPartSelectedGenders([...partSelectedGenders, opt.id]);
                                      }
                                    }} 
                                  />
                                  <span>{opt.name}</span>
                                </label>
                              ))}
                            </div>
                          )}
                        </div>
                      );
                    })()}
                  </>
                )}

                {/* Print Checkbox Options in Grid - Row 2, Cols 2-4 */}
                <div className="form-group" style={{ margin: 0, gridColumn: 'span 3' }}>
                  <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>പ്രിന്റ് ക്രമീകരണം (Print Options)</label>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '10px' }}>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79, 70, 229, 0.25)', minHeight: '38px', whiteSpace: 'nowrap' }}>
                      <input 
                        type="checkbox" 
                        checked={incRegSlNoInPrint} 
                        onChange={(e) => setIncRegSlNoInPrint(e.target.checked)} 
                      />
                      <span>ക്രമ നമ്പർ (Register Sl. No)</span>
                    </label>
                    <label style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'var(--bg-secondary)', padding: '6px 14px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79, 70, 229, 0.25)', minHeight: '38px', whiteSpace: 'nowrap' }}>
                      <input 
                        type="checkbox" 
                        checked={incMemNoInPrint} 
                        onChange={(e) => setIncMemNoInPrint(e.target.checked)} 
                      />
                      <span>അംഗത്വ നമ്പർ (Membership No)</span>
                    </label>
                  </div>
                </div>
              </div>

              {/* Dedicated Horizontal Action Buttons Row */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintParticipantsRoster('print')}
                  title="Print clean participants roster sheet"
                >
                  <Printer size={16} /> പ്രിന്റ് ചെയ്യുക
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ backgroundColor: '#059669', color: '#ffffff', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintParticipantsRoster('pdf')}
                  title="Directly save Participants Roster as PDF via Electron IPC"
                >
                  <Download size={16} /> PDF സേവ് ചെയ്യുക
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintEvaluationSheet('print')}
                  title="Print a blank evaluation sheet with Sl. No., Chest No., Mark, and Remarks"
                >
                  <ClipboardList size={16} /> Evaluation (Print)
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#0369a1', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintEvaluationSheet('pdf')}
                  title="Directly save Evaluation Sheet as PDF"
                >
                  <Download size={16} /> Evaluation (PDF)
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#166534', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintResultSheet('print')}
                  title="Print a blank result tabulation sheet with Sl. No., Chest No., Judge 1, Judge 2, Judge 3, Total, Place, and Grade"
                >
                  <Award size={16} /> Result (Print)
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#14532d', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintResultSheet('pdf')}
                  title="Directly save Result Sheet as PDF"
                >
                  <Download size={16} /> Result (PDF)
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintLotSheet('print')}
                  title="Print Lot Sheet with candidate details, Chest Number and Chance Number"
                >
                  <Hash size={16} /> Lot Sheet (Print)
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#4c1d95', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintLotSheet('pdf')}
                  title="Directly save Lot Sheet as PDF file via Electron IPC"
                >
                  <Download size={16} /> Lot Sheet (PDF)
                </button>

              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem 1rem' }}>
              <div className="table-container">
                <table className="cml-table">
                  <thead>
                    <tr>
                      <th>ചെസ്റ്റ് നം.</th>
                      <th>
                        <div>പേര് (Name)</div>
                        <div style={{ fontWeight: 'normal', fontSize: '0.85em', opacity: 0.85 }}>വീട്ടുപേര് (House Name)</div>
                      </th>
                      <th>ഇടവക (Parish)</th>
                      <th>വിഭാഗം (Category)</th>
                      <th>ജെൻഡർ</th>
                      <th>
                        {partFilterMode === 'multi' 
                          ? (partSelectedItems.length > 0 ? `തിരഞ്ഞെടുത്ത ഇനങ്ങൾ (${partSelectedItems.length})` : 'രജിസ്റ്റർ ചെയ്ത ഇനങ്ങൾ') 
                          : (partItemFilter ? `മത്സര ഇനം (${getItemDisplayName(partItemFilter)})` : 'രജിസ്റ്റർ ചെയ്ത ഇനങ്ങൾ')}
                      </th>
                      <th className="no-print">നടപടികൾ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredParticipants.map(p => (
                      <tr key={p.id}>
                        <td><strong>{p.chestNumber || '-'}</strong></td>
                        <td>
                          <div>
                            <strong>{p.name}</strong>
                            {(() => {
                              const pViolations = conflictWarningMap[p.id];
                              if (!pViolations || pViolations.length === 0) return null;
                              return (
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentYrData = db?.years?.[currentYear] || { participants: [] };
                                    const issues = getParticipantConflictDetails(p, currentYrData);
                                    setConflictDetailsModal({
                                      show: true,
                                      participantName: p.name,
                                      parish: p.parish,
                                      category: AGE_GROUPS[calculateAgeGroup(p.dob)] || '-',
                                      issues: issues.length > 0 ? issues : (conflictWarningMap[p.id] || [])
                                    });
                                  }}
                                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '6px', display: 'inline-flex', alignItems: 'center', gap: '3px', cursor: 'pointer' }}
                                  title="നിയമ ലംഘന വിവരങ്ങൾ കാണാൻ ക്ലിക്ക് ചെയ്യുക"
                                >
                                  ⚠️ നിയമ ലംഘനം (Conflict)
                                </span>
                              );
                            })()}
                          </div>
                          <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.houseName}</div>
                        </td>
                        <td>{p.parish}</td>
                        <td>{AGE_GROUPS[calculateAgeGroup(p.dob)] || 'Unknown'}</td>
                        <td>{p.gender === 'male' ? 'M' : 'F'}</td>
                        <td>
                          {(() => {
                            const { indItems, grpItems } = getDisplayItemsForParticipant(p);
                            if (indItems.length === 0 && grpItems.length === 0) {
                              return <span style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>-</span>;
                            }
                            return (
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {indItems.map(itemId => (
                                  <span key={itemId} style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {getItemDisplayName(itemId)}
                                  </span>
                                ))}
                                {grpItems.map(itemId => (
                                  <span key={itemId} style={{ fontSize: '0.75rem', backgroundColor: 'var(--gold-light)', color: 'var(--gold-color)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {getItemDisplayName(itemId)} (G)
                                  </span>
                                ))}
                              </div>
                            );
                          })()}
                        </td>
                        <td className="no-print">
                          <div style={{ display: 'flex', gap: '8px' }}>
                            <button className="btn btn-secondary" style={{ padding: '4px 8px' }} onClick={() => handleEditParticipant(p)}>
                              <Edit2 size={14} />
                            </button>
                            <button className="btn btn-danger" style={{ padding: '4px 8px' }} onClick={() => handleDeleteParticipant(p.id)}>
                              <Trash2 size={14} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                    {filteredParticipants.length === 0 && (
                      <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>മത്സരാർത്ഥികളെ കണ്ടെത്തിയില്ല.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowParticipantsModal(false)}>അടയ്ക്കുക (Close Window)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- MODAL: DEDICATED VIEW & PRINT GROUP ITEMS WINDOW --- */}
      {showGroupPrintModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className={`modal-content ${isGroupPrintMaximized ? 'maximized' : ''}`} style={isGroupPrintMaximized ? {} : { maxWidth: '1150px', width: '95vw', maxHeight: '90vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Award size={20} style={{ color: '#7c3aed' }} />
                <span>ഗ്രൂപ്പ് മത്സരങ്ങൾ — കാണാനും പ്രിന്റ് ചെയ്യാനും (View & Print Group Items)</span>
              </div>

              {/* Desktop Titlebar Controls */}
              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn" 
                  title={isGroupPrintMaximized ? "Restore Window (കുറയ്ക്കുക)" : "Maximize Window (വലുതാക്കുക)"}
                  onClick={() => setIsGroupPrintMaximized(!isGroupPrintMaximized)}
                >
                  {isGroupPrintMaximized ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                      <path d="M1.5 4.5V10.5H7.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="1" />
                    </svg>
                  )}
                </button>

                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  title="Close Window (അടയ്ക്കുക)"
                  onClick={() => setShowGroupPrintModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filter Bar & Action Buttons */}
            <div className="modal-filters" style={{ margin: '0.5rem 1rem 0.5rem 1rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '12px', alignItems: 'end', marginBottom: '14px' }}>
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>ഗ്രൂപ്പ് മത്സരം (Select Group Item)</label>
                  <select
                    className="form-select"
                    value={groupPrintItem}
                    onChange={(e) => setGroupPrintItem(e.target.value)}
                  >
                    <option value="all">എല്ലാ ഗ്രൂപ്പ് ഇനങ്ങളും (All Group Items)</option>
                    <option value="k_parichamuttu">പരിചമുട്ട്കളി (ആൺകുട്ടികൾ)</option>
                    <option value="k_margamkali">മാർഗ്ഗംകളി (പെൺകുട്ടികൾ)</option>
                    <option value="k_bible_drisya">ബൈബിൾ ദൃശ്യാവതരണം (പൊതുവായത്)</option>
                    <option value="k_mission_anthem">മിഷൻ ആന്തം (പൊതുവായത്)</option>
                    <option value="k_group_song">സമൂഹഗാനം (പൊതുവായത്)</option>
                  </select>
                </div>

                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontWeight: 'bold', marginBottom: '4px' }}>ഇടവക (Select Parish)</label>
                  <select
                    className="form-select"
                    value={groupPrintParish}
                    onChange={(e) => setGroupPrintParish(e.target.value)}
                  >
                    <option value="all">എല്ലാ ഇടവകകളും (All Parishes)</option>
                    {PARISHES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Buttons */}
              <div style={{ display: 'flex', justifyContent: 'flex-end', alignItems: 'center', flexWrap: 'wrap', gap: '10px', paddingTop: '12px', borderTop: '1px solid var(--border-color)' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 'bold', minHeight: '38px', padding: '0 18px' }}
                  onClick={() => handlePrintGroupRoster('print')}
                  title="Print complete group items roster with participating parishes and team members"
                >
                  <Printer size={16} /> പ്രിന്റ് ചെയ്യുക (Print Roster)
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#0284c7', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintGroupEvaluationSheet('print')}
                  title="Print Evaluation Sheet for group items"
                >
                  <ClipboardList size={16} /> Evaluation Sheet
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#166534', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintGroupResultSheet('print')}
                  title="Print Result Sheet for group items"
                >
                  <Award size={16} /> Result Sheet
                </button>
                <button
                  type="button"
                  className="btn"
                  style={{ backgroundColor: '#7c3aed', color: '#ffffff', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px', minHeight: '38px', padding: '0 16px' }}
                  onClick={() => handlePrintGroupLotSheet('print')}
                  title="Print Lot Sheet for group items with Chest No. and Chance No."
                >
                  <Hash size={16} /> Lot Sheet
                </button>
              </div>
            </div>

            {/* Modal Body */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              {groupPrintData.map(group => (
                <div key={group.itemId} style={{ marginBottom: '1.5rem', backgroundColor: 'var(--bg-secondary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', overflow: 'hidden' }}>
                  <div style={{ padding: '0.75rem 1.25rem', backgroundColor: 'var(--bg-tertiary)', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                      <Award size={18} style={{ color: '#7c3aed' }} />
                      <strong style={{ fontSize: '1.05rem', color: 'var(--text-main)' }}>{group.itemName}</strong>
                    </div>
                    <span style={{ backgroundColor: '#7c3aed', color: '#ffffff', padding: '2px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                      🏛️ {group.parishes.length} ഇടവകകൾ ({group.parishes.reduce((acc, curr) => acc + curr.members.length, 0)} അംഗങ്ങൾ)
                    </span>
                  </div>

                  <div className="table-container" style={{ padding: 0 }}>
                    <table className="cml-table" style={{ margin: 0 }}>
                      <thead>
                        <tr>
                          <th style={{ width: '45px' }}>ക്രമ നം.</th>
                          <th style={{ width: '180px' }}>ഇടവക (Parish)</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>ഗ്രൂപ്പ് ചെസ്റ്റ് നം.</th>
                          <th style={{ width: '90px', textAlign: 'center' }}>അംഗങ്ങൾ</th>
                          <th>രജിസ്റ്റർ ചെയ്ത അംഗങ്ങൾ (Team Members)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {group.parishes.map((pGroup, idx) => (
                          <tr key={pGroup.parish}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td><strong style={{ fontSize: '0.98rem', color: 'var(--primary-color)' }}>{pGroup.parish}</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              {pGroup.chestNumber ? (
                                <strong style={{ color: '#166534', fontSize: '1.05rem', backgroundColor: '#dcfce7', padding: '2px 10px', borderRadius: '6px', display: 'inline-block' }}>
                                  {pGroup.chestNumber}
                                </strong>
                              ) : (
                                <span style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 'bold' }}>നൽകിയിട്ടില്ല (-)</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{pGroup.members.length} പേർ</td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
                                {pGroup.members.map((m, mIdx) => (
                                  <span key={m.id} style={{ backgroundColor: 'var(--bg-primary)', border: '1px solid var(--border-color)', padding: '3px 8px', borderRadius: '4px', fontSize: '0.85rem' }}>
                                    {mIdx + 1}. <strong>{m.name}</strong> {m.houseName ? `(${m.houseName})` : ''}
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {groupPrintData.length === 0 && (
                <div style={{ textAlign: 'center', padding: '3rem', color: 'var(--text-muted)' }}>
                  <Award size={48} style={{ opacity: 0.3, marginBottom: '0.5rem' }} />
                  <p style={{ margin: 0, fontSize: '1rem', fontWeight: 'bold' }}>തിരഞ്ഞെടുത്ത ഗ്രൂപ്പ് ഇനത്തിൽ ഇടവകകളൊന്നും രജിസ്റ്റർ ചെയ്തിട്ടില്ല.</p>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowGroupPrintModal(false)}>അടയ്ക്കുക (Close Window)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEDICATED MODAL: ALLOTTED CHEST NUMBERS VIEW & QUICK EDIT --- */}
      {(showAllottedChestModal || (showChestManagementModal && chestModalSubTab === 'view_edit')) && (
        <div className={showChestManagementModal ? "" : "modal-overlay"} style={showChestManagementModal ? { flex: 1, display: 'flex', flexDirection: 'column' } : { zIndex: 999 }}>
          <div className={showChestManagementModal ? "" : `modal-content ${isAllottedChestMaximized ? 'maximized' : ''}`} style={showChestManagementModal ? { flex: 1, display: 'flex', flexDirection: 'column', padding: 0 } : (isAllottedChestMaximized ? {} : { maxWidth: '1150px', width: '95vw', maxHeight: '90vh' })}>
            
            {!showChestManagementModal && (
              <div className="modal-header">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  <Hash size={20} style={{ color: 'var(--primary-color)' }} />
                  <span style={{ fontWeight: 'bold' }}>അലോട്ട് ചെയ്ത ചെസ്റ്റ് നമ്പറുകൾ (Allotted Chest Numbers & Quick Edit)</span>
                </div>
                <div className="titlebar-controls no-print">
                  <button 
                    type="button" 
                    className="titlebar-btn" 
                    title={isAllottedChestMaximized ? "Restore Window" : "Maximize Window"}
                    onClick={() => setIsAllottedChestMaximized(!isAllottedChestMaximized)}
                  >
                    {isAllottedChestMaximized ? (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                        <path d="M1.5 3.5V10.5H8.5" />
                      </svg>
                    ) : (
                      <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                        <rect x="1.5" y="1.5" width="9" height="9" rx="0.5" />
                      </svg>
                    )}
                  </button>
                  <button 
                    type="button" 
                    className="titlebar-btn close-btn" 
                    title="Close Window"
                    onClick={() => setShowAllottedChestModal(false)}
                  >
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                    </svg>
                  </button>
                </div>
              </div>
            )}

            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem', padding: '1rem' }}>
              {/* Category Tab Switcher & Stats */}
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', backgroundColor: 'var(--bg-tertiary)', padding: '10px 14px', borderRadius: 'var(--radius-md)' }}>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button 
                    type="button" 
                    className={`btn ${allottedTab === 'individual' ? 'btn-primary' : 'btn-secondary'}`} 
                    style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 'bold' }}
                    onClick={() => { setAllottedTab('individual'); setEditingChestKey(null); }}
                  >
                    <Users size={15} /> വ്യക്തിഗത മത്സരങ്ങൾ ({participants.length})
                  </button>
                  <button 
                    type="button" 
                    className={`btn ${allottedTab === 'group' ? 'btn-primary' : 'btn-secondary'}`} 
                    style={{ padding: '6px 16px', fontSize: '0.85rem', fontWeight: 'bold' }}
                    onClick={() => { setAllottedTab('group'); setEditingChestKey(null); }}
                  >
                    <Layers size={15} /> ഗ്രൂപ്പ് മത്സരങ്ങൾ
                  </button>
                </div>

                {/* Quick Stats Badges */}
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap' }}>
                  {allottedTab === 'individual' ? (() => {
                    const allottedCount = participants.filter(p => p.chestNumber).length;
                    const pendingCount = participants.length - allottedCount;
                    return (
                      <>
                        <div style={{ backgroundColor: '#dbeafe', color: '#1e40af', padding: '4px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                          നൽകിയവ: {allottedCount} പേർ
                        </div>
                        <div style={{ backgroundColor: pendingCount > 0 ? '#fee2e2' : '#dcfce7', color: pendingCount > 0 ? '#991b1b' : '#166534', padding: '4px 10px', borderRadius: '6px', fontSize: '0.82rem', fontWeight: 'bold' }}>
                          ബാക്കി: {pendingCount} പേർ
                        </div>
                      </>
                    );
                  })() : null}
                </div>
              </div>

              {/* Filter Bar */}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', alignItems: 'center', backgroundColor: 'var(--bg-secondary)', padding: '12px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <div className="search-input" style={{ width: '100%' }}>
                  <Search size={16} />
                  <input 
                    type="text" 
                    placeholder="ചെസ്റ്റ് നം / പേര് / ഇടവക..." 
                    value={allottedSearch} 
                    onChange={(e) => setAllottedSearch(e.target.value)} 
                  />
                </div>

                <div>
                  <select className="form-select" value={allottedStatusFilter} onChange={(e) => setAllottedStatusFilter(e.target.value)}>
                    <option value="all">എല്ലാ സ്റ്റാറ്റസും (All Status)</option>
                    <option value="allotted">നമ്പർ നൽകിയവ മാത്രം (Allotted)</option>
                    <option value="pending">നമ്പർ നൽകാത്തവ മാത്രം (Pending)</option>
                  </select>
                </div>

                <div>
                  <select className="form-select" value={allottedParishFilter} onChange={(e) => setAllottedParishFilter(e.target.value)}>
                    <option value="">എല്ലാ ഇടവകകളും (All Parishes)</option>
                    {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                  </select>
                </div>

                {allottedTab === 'individual' && (
                  <div>
                    <select className="form-select" value={allottedCategoryFilter} onChange={(e) => setAllottedCategoryFilter(e.target.value)}>
                      <option value="">എല്ലാ വിഭാഗങ്ങളും (All Categories)</option>
                      {Object.entries(AGE_GROUPS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>
                )}

                <div style={{ display: 'flex', gap: '8px', justifySelf: 'end' }}>
                  <button type="button" className="btn btn-secondary" style={{ padding: '6px 12px', fontSize: '0.85rem' }} onClick={() => handlePrintAllottedChestList('print')}>
                    <Printer size={15} /> പ്രിന്റ്
                  </button>
                  <button type="button" className="btn" style={{ backgroundColor: '#059669', color: '#ffffff', padding: '6px 12px', fontSize: '0.85rem', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '4px' }} onClick={() => handlePrintAllottedChestList('pdf')}>
                    <Download size={15} /> PDF
                  </button>
                </div>
              </div>

              {/* Table Body */}
              <div className="table-container" style={{ flex: 1, maxHeight: '55vh', overflowY: 'auto' }}>
                {allottedTab === 'individual' ? (() => {
                  let list = [...participants];
                  if (allottedStatusFilter === 'allotted') list = list.filter(p => p.chestNumber);
                  else if (allottedStatusFilter === 'pending') list = list.filter(p => !p.chestNumber);
                  if (allottedParishFilter) list = list.filter(p => p.parish === allottedParishFilter);
                  if (allottedCategoryFilter) list = list.filter(p => calculateAgeGroup(p.dob) === allottedCategoryFilter);
                  if (allottedSearch) {
                    const q = allottedSearch.toLowerCase();
                    list = list.filter(p => (p.name || '').toLowerCase().includes(q) || (p.chestNumber || '').includes(q) || (p.parish || '').toLowerCase().includes(q) || (p.houseName || '').toLowerCase().includes(q));
                  }

                  list.sort((a, b) => {
                    const na = parseInt(a.chestNumber) || 999999;
                    const nb = parseInt(b.chestNumber) || 999999;
                    if (na !== nb) return na - nb;
                    return (a.name || '').localeCompare(b.name || '');
                  });

                  return (
                    <table className="cml-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center' }}>Sl.</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>ചെസ്റ്റ് നമ്പർ</th>
                          <th>പേര് & വീട്ടുപേര്</th>
                          <th>ഇടവക</th>
                          <th style={{ textAlign: 'center' }}>വിഭാഗം</th>
                          <th style={{ textAlign: 'center' }}>ലിംഗം</th>
                          <th>രജിസ്റ്റർ ചെയ്ത ഇനങ്ങൾ</th>
                          <th style={{ width: '110px', textAlign: 'center' }}>നടപടി</th>
                        </tr>
                      </thead>
                      <tbody>
                        {list.map((p, idx) => {
                          const isEditing = editingChestKey === p.id;
                          return (
                            <tr key={p.id} style={{ backgroundColor: isEditing ? 'rgba(79, 70, 229, 0.08)' : undefined }}>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                              <td style={{ textAlign: 'center' }}>
                                {isEditing ? (
                                  <input 
                                    type="text" 
                                    autoFocus
                                    className="form-control" 
                                    style={{ width: '80px', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', color: '#1e3a8a' }}
                                    value={editingChestValue} 
                                    onChange={(e) => setEditingChestValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlineChestNumber(p.id, editingChestValue);
                                      if (e.key === 'Escape') setEditingChestKey(null);
                                    }}
                                  />
                                ) : (
                                  p.chestNumber ? (
                                    <span style={{ display: 'inline-block', backgroundColor: '#dbeafe', color: '#1e40af', padding: '3px 10px', borderRadius: '4px', fontWeight: '800', fontSize: '1.05rem', minWidth: '45px' }}>
                                      {p.chestNumber}
                                    </span>
                                  ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>നൽകിയിട്ടില്ല</span>
                                  )
                                )}
                              </td>
                              <td>
                                <div style={{ fontWeight: 'bold' }}>{p.name}</div>
                                <div style={{ fontSize: '0.85em', color: 'var(--text-muted)' }}>{p.houseName}</div>
                              </td>
                              <td>{p.parish}</td>
                              <td style={{ textAlign: 'center' }}>{AGE_GROUPS_SHORT_ENG[calculateAgeGroup(p.dob)] || '-'}</td>
                              <td style={{ textAlign: 'center' }}>{p.gender === 'male' ? 'M' : 'F'}</td>
                              <td>
                                <div style={{ fontSize: '0.85rem' }}>
                                  {(p.registeredItems || []).map(getItemDisplayName).join(', ') || '-'}
                                </div>
                              </td>
                              <td style={{ textAlign: 'center' }}>
                                {isEditing ? (
                                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                    <button 
                                      type="button" 
                                      className="btn btn-sm btn-primary" 
                                      style={{ padding: '3px 8px' }}
                                      title="Save (സേവ് ചെയ്യുക)"
                                      onClick={() => handleSaveInlineChestNumber(p.id, editingChestValue)}
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button 
                                      type="button" 
                                      className="btn btn-sm btn-secondary" 
                                      style={{ padding: '3px 8px' }}
                                      title="Cancel (റദ്ദാക്കുക)"
                                      onClick={() => setEditingChestKey(null)}
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    type="button" 
                                    className="btn btn-sm btn-secondary" 
                                    style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    title="Edit Chest Number"
                                    onClick={() => {
                                      setEditingChestKey(p.id);
                                      setEditingChestValue(p.chestNumber || '');
                                    }}
                                  >
                                    <Edit2 size={13} /> തിരുത്തുക
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {list.length === 0 && (
                          <tr>
                            <td colSpan={8} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                              മത്സരാർത്ഥികളെയൊന്നും കണ്ടെത്തിയില്ല.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  );
                })() : (() => {
                  let gList = [];
                  const currentGroupChestNumbers = db?.years?.[currentYear]?.groupChestNumbers || {};
                  const allGroupItemIds = ['k_parichamuttu', 'k_margamkali', 'k_bible_drisya', 'k_mission_anthem', 'k_group_song'];
                  
                  allGroupItemIds.forEach(itemId => {
                    const parMap = {};
                    participants.forEach(p => {
                      if ((p.registeredGroupItems || []).includes(itemId)) {
                        if (!parMap[p.parish]) parMap[p.parish] = [];
                        parMap[p.parish].push(p);
                      }
                    });

                    Object.keys(parMap).forEach(parish => {
                      const cNum = currentGroupChestNumbers?.[itemId]?.[parish] || '';
                      gList.push({ itemId, parish, memberCount: parMap[parish].length, chestNumber: cNum });
                    });
                  });

                  if (allottedStatusFilter === 'allotted') gList = gList.filter(g => g.chestNumber);
                  else if (allottedStatusFilter === 'pending') gList = gList.filter(g => !g.chestNumber);
                  if (allottedParishFilter) gList = gList.filter(g => g.parish === allottedParishFilter);
                  if (allottedSearch) {
                    const q = allottedSearch.toLowerCase();
                    gList = gList.filter(g => (g.parish || '').toLowerCase().includes(q) || (g.chestNumber || '').includes(q) || (ITEM_NAMES_MAP[g.itemId] || '').toLowerCase().includes(q));
                  }

                  gList.sort((a, b) => {
                    const na = parseInt(a.chestNumber) || 999999;
                    const nb = parseInt(b.chestNumber) || 999999;
                    if (na !== nb) return na - nb;
                    return (a.parish || '').localeCompare(b.parish || '');
                  });

                  return (
                    <table className="cml-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px', textAlign: 'center' }}>Sl.</th>
                          <th style={{ width: '150px', textAlign: 'center' }}>ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പർ</th>
                          <th>ഗ്രൂപ്പ് ഇനം (Group Item)</th>
                          <th>ഇടവക (Parish)</th>
                          <th style={{ width: '130px', textAlign: 'center' }}>ടീം അംഗങ്ങൾ</th>
                          <th style={{ width: '110px', textAlign: 'center' }}>നടപടി</th>
                        </tr>
                      </thead>
                      <tbody>
                        {gList.map((g, idx) => {
                          const key = `grp_${g.itemId}_${g.parish}`;
                          const isEditing = editingChestKey === key;
                          return (
                            <tr key={key} style={{ backgroundColor: isEditing ? 'rgba(79, 70, 229, 0.08)' : undefined }}>
                              <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{idx + 1}</td>
                              <td style={{ textAlign: 'center' }}>
                                {isEditing ? (
                                  <input 
                                    type="text" 
                                    autoFocus
                                    className="form-control" 
                                    style={{ width: '90px', padding: '3px 6px', textAlign: 'center', fontWeight: 'bold', fontSize: '1rem', color: '#166534' }}
                                    value={editingChestValue} 
                                    onChange={(e) => setEditingChestValue(e.target.value)}
                                    onKeyDown={(e) => {
                                      if (e.key === 'Enter') handleSaveInlineGroupChestNumber(g.itemId, g.parish, editingChestValue);
                                      if (e.key === 'Escape') setEditingChestKey(null);
                                    }}
                                  />
                                ) : (
                                  g.chestNumber ? (
                                    <span style={{ display: 'inline-block', backgroundColor: '#dcfce7', color: '#166534', padding: '3px 10px', borderRadius: '4px', fontWeight: '800', fontSize: '1.05rem', minWidth: '45px' }}>
                                      {g.chestNumber}
                                    </span>
                                  ) : (
                                    <span style={{ color: '#94a3b8', fontSize: '0.85rem', fontStyle: 'italic' }}>നൽകിയിട്ടില്ല</span>
                                  )
                                )}
                              </td>
                              <td style={{ fontWeight: 'bold' }}>{ITEM_NAMES_MAP[g.itemId] || g.itemId}</td>
                              <td style={{ fontWeight: 'bold' }}>{g.parish}</td>
                              <td style={{ textAlign: 'center' }}>{g.memberCount} അംഗങ്ങൾ</td>
                              <td style={{ textAlign: 'center' }}>
                                {isEditing ? (
                                  <div style={{ display: 'flex', justifyContent: 'center', gap: '6px' }}>
                                    <button 
                                      type="button" 
                                      className="btn btn-sm btn-primary" 
                                      style={{ padding: '3px 8px' }}
                                      title="Save"
                                      onClick={() => handleSaveInlineGroupChestNumber(g.itemId, g.parish, editingChestValue)}
                                    >
                                      <Check size={14} />
                                    </button>
                                    <button 
                                      type="button" 
                                      className="btn btn-sm btn-secondary" 
                                      style={{ padding: '3px 8px' }}
                                      title="Cancel"
                                      onClick={() => setEditingChestKey(null)}
                                    >
                                      <XCircle size={14} />
                                    </button>
                                  </div>
                                ) : (
                                  <button 
                                    type="button" 
                                    className="btn btn-sm btn-secondary" 
                                    style={{ padding: '4px 10px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px' }}
                                    title="Edit Group Chest Number"
                                    onClick={() => {
                                      setEditingChestKey(key);
                                      setEditingChestValue(g.chestNumber || '');
                                    }}
                                  >
                                    <Edit2 size={13} /> തിരുത്തുക
                                  </button>
                                )}
                              </td>
                            </tr>
                          );
                        })}
                        {gList.length === 0 && (
                          <tr>
                            <td colSpan={6} style={{ textAlign: 'center', padding: '20px', color: 'var(--text-muted)' }}>
                              ഗ്രൂപ്പ് ടീമുകളെയൊന്നും കണ്ടെത്തിയില്ല.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  );
                })()}
              </div>
            </div>

            {!showChestManagementModal && (
              <div className="modal-footer" style={{ borderTop: '1px solid var(--border-color)', padding: '0.75rem 1rem', display: 'flex', justifyContent: 'flex-end' }}>
                <button type="button" className="btn btn-secondary" onClick={() => setShowAllottedChestModal(false)}>
                  അടയ്ക്കുക (Close)
                </button>
              </div>
            )}
          </div>
        </div>
      )}

{/* --- MODAL 2: DEDICATED CHEST NUMBER MANAGEMENT WINDOW --- */}
      {showChestManagementModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className={`modal-content ${isChestMaximized ? 'maximized' : ''}`} style={isChestMaximized ? {} : { maxWidth: '1150px', width: '95vw', maxHeight: '90vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Hash size={20} style={{ color: 'var(--primary-color)' }} />
                <span>ചെസ്റ്റ് നമ്പർ ക്രമീകരണങ്ങൾ (Chest Number Management)</span>
              </div>

              {/* Desktop Titlebar Controls */}
              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn" 
                  title={isChestMaximized ? "Restore Window (കുറയ്ക്കുക)" : "Maximize Window (വലുതാക്കുക)"}
                  onClick={() => setIsChestMaximized(!isChestMaximized)}
                >
                  {isChestMaximized ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                      <path d="M1.5 3.5V10.5H8.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="0.5" />
                    </svg>
                  )}
                </button>
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  title="Close Window (അടയ്ക്കുക)"
                  onClick={() => setShowChestManagementModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Sub-Tab Bar */}
            <div style={{ display: 'flex', gap: '0.5rem', padding: '0.75rem 1.25rem 0 1.25rem', borderBottom: '2px solid var(--border-color)' }}>
              <button 
                type="button" 
                className={`btn ${chestModalSubTab === 'auto' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ borderRadius: '4px 4px 0 0', padding: '8px 18px' }}
                onClick={() => setChestModalSubTab('auto')}
              >
                <Hash size={16} /> ചെസ്റ്റ് നമ്പർ നൽകുക (Auto-Assign)
              </button>
              <button 
                type="button" 
                className={`btn ${chestModalSubTab === 'clear' ? 'btn-danger' : 'btn-secondary'}`} 
                style={{ borderRadius: '4px 4px 0 0', padding: '8px 18px' }}
                onClick={() => setChestModalSubTab('clear')}
              >
                <XCircle size={16} /> ചെസ്റ്റ് നമ്പർ റദ്ദാക്കുക (Clear Chest No)
              </button>
              <button 
                type="button" 
                className={`btn ${chestModalSubTab === 'view_edit' ? 'btn-primary' : 'btn-secondary'}`} 
                style={{ borderRadius: '4px 4px 0 0', padding: '8px 18px', display: 'flex', alignItems: 'center', gap: '6px' }}
                onClick={() => setChestModalSubTab('view_edit')}
              >
                <Eye size={16} /> നൽകിയിട്ടുള്ളവ & തിരുത്തൽ (Allotted Numbers)
              </button>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              {/* SUB-TAB 1: Auto-Assign Chest Numbers Options */}
              {chestModalSubTab === 'auto' && (
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '1rem' }}>
                    <button 
                      type="button" 
                      className={`btn ${autoChestTab === 'individual' ? 'btn-primary' : 'btn-secondary'}`} 
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                      onClick={() => {
                        setAutoChestTab('individual');
                        setAutoChestModal(prev => ({ ...prev, itemId: '' }));
                      }}
                    >
                      <Users size={15} /> വ്യക്തിഗത മത്സരങ്ങൾ (Individual Items)
                    </button>
                    <button 
                      type="button" 
                      className={`btn ${autoChestTab === 'group' ? 'btn-primary' : 'btn-secondary'}`} 
                      style={{ padding: '6px 14px', fontSize: '0.85rem' }}
                      onClick={() => {
                        setAutoChestTab('group');
                        setAutoChestModal(prev => ({ ...prev, itemId: '' }));
                      }}
                    >
                      <Award size={15} /> ഗ്രൂപ്പ് മത്സരങ്ങൾ (Group Items)
                    </button>
                  </div>

                  {autoChestTab === 'individual' && (
                    <>
                      <div className="form-grid" style={{ marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">മത്സര തരം (Category)</label>
                          <select 
                            className="form-select"
                            value={autoChestModal.category}
                            onChange={(e) => setAutoChestModal({ ...autoChestModal, category: e.target.value, itemId: "" })}
                          >
                            <option value="sahithya">സാഹിത്യ മത്സരം</option>
                            <option value="kalaa">കലാ മത്സരം</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">പ്രായവിഭാഗം (Age Group)</label>
                          <select 
                            className="form-select"
                            value={autoChestModal.ageCategory}
                            onChange={(e) => setAutoChestModal({ ...autoChestModal, ageCategory: e.target.value, itemId: "" })}
                          >
                            {Object.entries(AGE_GROUPS).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">ജെൻഡർ (Gender)</label>
                          <select 
                            className="form-select"
                            value={autoChestModal.gender}
                            onChange={(e) => setAutoChestModal({ ...autoChestModal, gender: e.target.value, itemId: "" })}
                          >
                            <option value="male">ആൺകുട്ടികൾ (Male)</option>
                            <option value="female">പെൺകുട്ടികൾ (Female)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">ആരംഭ നമ്പർ (Starting Number)</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={autoChestModal.startingNumber}
                            onChange={(e) => setAutoChestModal({ ...autoChestModal, startingNumber: e.target.value })}
                          />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="form-label">വ്യക്തിഗത മത്സര ഇനം തിരഞ്ഞെടുക്കുക *</label>
                          <select 
                            className="form-select"
                            value={autoChestModal.itemId}
                            onChange={(e) => setAutoChestModal({ ...autoChestModal, itemId: e.target.value })}
                          >
                            <option value="">ഇനം തിരഞ്ഞെടുക്കുക</option>
                            {itemsForAutoAssignDropdown.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <button type="button" className="btn btn-primary" onClick={executeAutoAssignChestNumbers}>
                          <Check size={16} /> ഓട്ടോമാറ്റിക് ആയി ചെസ്റ്റ് നമ്പർ നൽകുക (Generate Chest Numbers)
                        </button>
                      </div>
                    </>
                  )}

                  {autoChestTab === 'group' && (
                    <>
                      <div className="form-grid" style={{ marginBottom: '1rem' }}>
                        <div className="form-group">
                          <label className="form-label">ഗ്രൂപ്പ് തരം (Group Scope)</label>
                          <select 
                            className="form-select"
                            value={autoChestModal.groupType}
                            onChange={(e) => setAutoChestModal({ ...autoChestModal, groupType: e.target.value, itemId: "" })}
                          >
                            <option value="gender_based">ജെൻഡർ ഗ്രൂപ്പ് ഇനങ്ങൾ (Gender Group Items)</option>
                            <option value="common">പൊതുവായ ഗ്രൂപ്പ് ഇനങ്ങൾ (Common Group Items)</option>
                          </select>
                        </div>

                        {autoChestModal.groupType === 'gender_based' && (
                          <div className="form-group">
                            <label className="form-label">ജെൻഡർ (Gender)</label>
                            <select 
                              className="form-select"
                              value={autoChestModal.gender}
                              onChange={(e) => setAutoChestModal({ ...autoChestModal, gender: e.target.value, itemId: "" })}
                            >
                              <option value="male">ആൺകുട്ടികൾ (Parichamuttukali)</option>
                              <option value="female">പെൺകുട്ടികൾ (Margamkali)</option>
                            </select>
                          </div>
                        )}

                        <div className="form-group">
                          <label className="form-label">ആരംഭ നമ്പർ (Starting Number)</label>
                          <input 
                            type="number" 
                            className="form-input" 
                            value={autoChestModal.startingNumber}
                            onChange={(e) => setAutoChestModal({ ...autoChestModal, startingNumber: e.target.value })}
                          />
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="form-label">ഗ്രൂപ്പ് മത്സര ഇനം തിരഞ്ഞെടുക്കുക *</label>
                          <select 
                            className="form-select"
                            value={autoChestModal.itemId}
                            onChange={(e) => setAutoChestModal({ ...autoChestModal, itemId: e.target.value })}
                          >
                            <option value="">ഇനം തിരഞ്ഞെടുക്കുക</option>
                            {itemsForAutoAssignDropdown.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      </div>

                      <div style={{ textAlign: 'right' }}>
                        <button type="button" className="btn btn-primary" onClick={executeAutoAssignChestNumbers}>
                          <Check size={16} /> ഓട്ടോമാറ്റിക് ആയി ചെസ്റ്റ് നമ്പർ നൽകുക (Generate Chest Numbers)
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}

              {/* SUB-TAB 2: Clear Chest Numbers Options */}
              {chestModalSubTab === 'clear' && (
                <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)' }}>
                  <div className="form-grid" style={{ marginBottom: '1rem' }}>
                    <div className="form-group" style={{ gridColumn: 'span 2' }}>
                      <label className="form-label">റദ്ദാക്കേണ്ട രീതി തിരഞ്ഞെടുക്കുക (Select Option)</label>
                      <select 
                        className="form-select"
                        value={clearChestModal.mode}
                        onChange={(e) => setClearChestModal({ ...clearChestModal, mode: e.target.value, itemId: "" })}
                      >
                        <option value="all">എല്ലാ മത്സരാർത്ഥികളുടെയും ചെസ്റ്റ് നമ്പർ (All Participants)</option>
                        <option value="category_ind">വ്യക്തിഗത മത്സരങ്ങൾ - വിഭാഗവും ജെൻഡറും തിരിച്ച് (Individual Items)</option>
                        <option value="group_gender">ജെൻഡർ ഗ്രൂപ്പ് മത്സരങ്ങൾ (Gender Group Items)</option>
                        <option value="group_common">പൊതുവായ ഗ്രൂപ്പ് മത്സരങ്ങൾ (Common Group Items)</option>
                        <option value="participant">പ്രത്യേക മത്സരാർത്ഥിയുടെ മാത്രം (Specific Participant)</option>
                      </select>
                    </div>

                    {clearChestModal.mode === 'category_ind' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">വിഭാഗം (Age Category)</label>
                          <select 
                            className="form-select"
                            value={clearChestModal.category}
                            onChange={(e) => setClearChestModal({ ...clearChestModal, category: e.target.value })}
                          >
                            {Object.entries(AGE_GROUPS).map(([k, v]) => (
                              <option key={k} value={k}>{v}</option>
                            ))}
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">ജെൻഡർ (Gender)</label>
                          <select 
                            className="form-select"
                            value={clearChestModal.gender}
                            onChange={(e) => setClearChestModal({ ...clearChestModal, gender: e.target.value, itemId: "" })}
                          >
                            <option value="all">എല്ലാ ജെൻഡറും (All Genders)</option>
                            <option value="male">ആൺകുട്ടികൾ മാത്രം (Male Only)</option>
                            <option value="female">പെൺകുട്ടികൾ മാത്രം (Female Only)</option>
                          </select>
                        </div>

                        <div className="form-group" style={{ gridColumn: 'span 2' }}>
                          <label className="form-label">വ്യക്തിഗത മത്സര ഇനം (Select Individual Item)</label>
                          <select 
                            className="form-select"
                            value={clearChestModal.itemId}
                            onChange={(e) => setClearChestModal({ ...clearChestModal, itemId: e.target.value })}
                          >
                            <option value="">എല്ലാ വ്യക്തിഗത ഇനങ്ങളും (All Individual Items)</option>
                            {itemsForClearChestDropdown.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {clearChestModal.mode === 'group_gender' && (
                      <>
                        <div className="form-group">
                          <label className="form-label">ജെൻഡർ (Gender)</label>
                          <select 
                            className="form-select"
                            value={clearChestModal.gender}
                            onChange={(e) => setClearChestModal({ ...clearChestModal, gender: e.target.value, itemId: "" })}
                          >
                            <option value="all">എല്ലാ ജെൻഡറും (All Genders)</option>
                            <option value="male">ആൺകുട്ടികൾ മാത്രം (Parichamuttukali)</option>
                            <option value="female">പെൺകുട്ടികൾ മാത്രം (Margamkali)</option>
                          </select>
                        </div>

                        <div className="form-group">
                          <label className="form-label">ജെൻഡർ ഗ്രൂപ്പ് ഇനം (Select Group Item)</label>
                          <select 
                            className="form-select"
                            value={clearChestModal.itemId}
                            onChange={(e) => setClearChestModal({ ...clearChestModal, itemId: e.target.value })}
                          >
                            <option value="">എല്ലാ ജെൻഡർ ഗ്രൂപ്പ് ഇനങ്ങളും (All Gender Group Items)</option>
                            {itemsForClearChestDropdown.map(item => (
                              <option key={item.id} value={item.id}>{item.name}</option>
                            ))}
                          </select>
                        </div>
                      </>
                    )}

                    {clearChestModal.mode === 'group_common' && (
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">പൊതുവായ ഗ്രൂപ്പ് ഇനം (Select Common Group Item)</label>
                        <select 
                          className="form-select"
                          value={clearChestModal.itemId}
                          onChange={(e) => setClearChestModal({ ...clearChestModal, itemId: e.target.value })}
                        >
                          <option value="">എല്ലാ പൊതുവായ ഗ്രൂപ്പ് ഇനങ്ങളും (All Common Group Items)</option>
                          {itemsForClearChestDropdown.map(item => (
                            <option key={item.id} value={item.id}>{item.name}</option>
                          ))}
                        </select>
                      </div>
                    )}

                    {clearChestModal.mode === 'participant' && (
                      <div className="form-group" style={{ gridColumn: 'span 2' }}>
                        <label className="form-label">മത്സരാർത്ഥി (Participant)</label>
                        <select 
                          className="form-select"
                          value={clearChestModal.participantId}
                          onChange={(e) => setClearChestModal({ ...clearChestModal, participantId: e.target.value })}
                        >
                          <option value="">തിരഞ്ഞെടുക്കുക</option>
                          {participants.filter(p => p.chestNumber).map(p => (
                            <option key={p.id} value={p.id}>{p.name} ({p.parish}) - Chest: {p.chestNumber}</option>
                          ))}
                        </select>
                      </div>
                    )}
                  </div>

                  <div style={{ textAlign: 'right' }}>
                    <button type="button" className="btn btn-danger" onClick={() => setConfirmClearModal(true)}>
                      <XCircle size={16} /> ചെസ്റ്റ് നമ്പർ മാറ്റുക (Clear Chest Numbers)
                    </button>
                  </div>
                </div>
              )}

              {/* LIVE FILTERED PARTICIPANTS LIST DISPLAYED BELOW OPTIONS */}
              {chestModalSubTab === 'auto' && autoChestTab === 'group' ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>
                      പങ്കെടുക്കുന്ന ഇടവകകളുടെ വിവരങ്ങൾ (Group Items List)
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ backgroundColor: 'var(--primary-color)', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        🏛️ പങ്കെടുക്കുന്ന ആകെ ഇടവകകൾ: {groupParishesChestData.length}
                      </span>
                      <span style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        👥 ആകെ മത്സരാർത്ഥികൾ: {groupParishesChestData.reduce((acc, curr) => acc + curr.members.length, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    <table className="cml-table">
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>ക്രമ നം.</th>
                          <th style={{ width: '180px' }}>ഇടവക (Parish)</th>
                          <th style={{ width: '140px', textAlign: 'center' }}>ഗ്രൂപ്പ് ചെസ്റ്റ് നം.</th>
                          <th style={{ width: '90px', textAlign: 'center' }}>അംഗങ്ങൾ</th>
                          <th>മത്സരാർത്ഥികൾ (Team Members)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {groupParishesChestData.map((g, idx) => (
                          <tr key={g.parish}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td><strong style={{ fontSize: '0.98rem', color: 'var(--primary-color)' }}>{g.parish}</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              {g.chestNumber ? (
                                <strong style={{ color: '#166534', fontSize: '1.05rem', backgroundColor: '#dcfce7', padding: '2px 10px', borderRadius: '6px', display: 'inline-block' }}>
                                  {g.chestNumber}
                                </strong>
                              ) : (
                                <span style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 'bold' }}>നൽകിയിട്ടില്ല (-)</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{g.members.length} പേർ</td>
                            <td style={{ fontSize: '0.88rem' }}>
                              {g.members.map((m, mIdx) => (
                                <span key={m.id} style={{ display: 'inline-block', marginRight: '8px', marginBottom: '2px', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {mIdx + 1}. {m.name}{m.houseName ? ` (${m.houseName})` : ''}
                                </span>
                              ))}
                            </td>
                          </tr>
                        ))}
                        {groupParishesChestData.length === 0 && (
                          <tr><td colSpan="5" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>ഈ ഗ്രൂപ്പ് ഇനത്തിൽ രജിസ്റ്റർ ചെയ്ത ഇടവകകളൊന്നും കണ്ടെത്തിയില്ല. മുകളിലെ ഡ്രോപ്ഡൗണിൽ നിന്നും ഗ്രൂപ്പ് ഇനം തിരഞ്ഞെടുക്കുക.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (chestModalSubTab === 'clear' && (clearChestModal.mode === 'group_gender' || clearChestModal.mode === 'group_common')) ? (
                <div>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.75rem', flexWrap: 'wrap', gap: '0.5rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', margin: 0, color: 'var(--primary-color)' }}>
                      റദ്ദാക്കാനായി തിരഞ്ഞെടുത്ത ഗ്രൂപ്പ് ഇനങ്ങളുടെ വിവരങ്ങൾ
                    </h4>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <span style={{ backgroundColor: 'var(--primary-color)', color: '#ffffff', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        🏛️ ആകെ ഗ്രൂപ്പ് ടീമുകൾ: {clearGroupParishesChestData.length}
                      </span>
                      <span style={{ backgroundColor: 'var(--bg-secondary)', color: 'var(--text-main)', border: '1px solid var(--border-color)', padding: '3px 10px', borderRadius: '12px', fontSize: '0.85rem', fontWeight: 'bold' }}>
                        👥 ആകെ അംഗങ്ങൾ: {clearGroupParishesChestData.reduce((acc, curr) => acc + curr.members.length, 0)}
                      </span>
                    </div>
                  </div>

                  <div className="table-container" style={{ maxHeight: '320px', overflowY: 'auto' }}>
                    <table className="cml-table">
                      <thead>
                        <tr>
                          <th style={{ width: '45px' }}>ക്രമ നം.</th>
                          <th style={{ width: '160px' }}>ഗ്രൂപ്പ് ഇനം (Group Item)</th>
                          <th style={{ width: '160px' }}>ഇടവക (Parish)</th>
                          <th style={{ width: '150px', textAlign: 'center' }}>നിലവിലെ ഗ്രൂപ്പ് ചെസ്റ്റ് നം.</th>
                          <th style={{ width: '90px', textAlign: 'center' }}>അംഗങ്ങൾ</th>
                          <th>മത്സരാർത്ഥികൾ (Team Members)</th>
                        </tr>
                      </thead>
                      <tbody>
                        {clearGroupParishesChestData.map((g, idx) => (
                          <tr key={`${g.itemId}-${g.parish}`}>
                            <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                            <td><strong style={{ color: '#7c3aed' }}>{g.itemName}</strong></td>
                            <td><strong style={{ fontSize: '0.98rem', color: 'var(--primary-color)' }}>{g.parish}</strong></td>
                            <td style={{ textAlign: 'center' }}>
                              {g.chestNumber ? (
                                <strong style={{ color: '#166534', fontSize: '1.05rem', backgroundColor: '#dcfce7', padding: '2px 10px', borderRadius: '6px', display: 'inline-block' }}>
                                  {g.chestNumber}
                                </strong>
                              ) : (
                                <span style={{ color: '#dc2626', fontSize: '0.82rem', fontWeight: 'bold' }}>നൽകിയിട്ടില്ല (-)</span>
                              )}
                            </td>
                            <td style={{ textAlign: 'center', fontWeight: 'bold' }}>{g.members.length} പേർ</td>
                            <td style={{ fontSize: '0.88rem' }}>
                              {g.members.map((m, mIdx) => (
                                <span key={m.id} style={{ display: 'inline-block', marginRight: '8px', marginBottom: '2px', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                                  {mIdx + 1}. {m.name}{m.houseName ? ` (${m.houseName})` : ''}
                                </span>
                              ))}
                            </td>
                          </tr>
                        ))}
                        {clearGroupParishesChestData.length === 0 && (
                          <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>തിരഞ്ഞെടുത്ത ഗ്രൂപ്പ് ഇനത്തിൽ വിവരങ്ങളൊന്നും കണ്ടെത്തിയില്ല.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              ) : (
                <div>
                  <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary-color)', borderBottom: '1px solid var(--border-color)', paddingBottom: '0.25rem' }}>
                    തിരഞ്ഞെടുത്ത ഓപ്ഷനുകൾക്കനുസരിച്ചുള്ള മത്സരാർത്ഥികളുടെ വിവരങ്ങൾ ({liveChestManagementParticipants.length} പേർ)
                  </h4>
                  <div className="table-container" style={{ maxHeight: '300px', overflowY: 'auto' }}>
                    <table className="cml-table">
                      <thead>
                        <tr>
                          <th>ചെസ്റ്റ് നം.</th>
                          <th>പേര് (Name)</th>
                          <th>വീട്ടുപേര് (House Name)</th>
                          <th>ഇടവക (Parish)</th>
                          <th>വിഭാഗം (Category)</th>
                          <th>ജെൻഡർ</th>
                          <th>രജിസ്റ്റർ ചെയ്ത ഇനങ്ങൾ</th>
                        </tr>
                      </thead>
                      <tbody>
                        {liveChestManagementParticipants.map(p => (
                          <tr key={p.id}>
                            <td>
                              {p.chestNumber ? (
                                <strong style={{ color: 'var(--primary-color)', fontSize: '0.95rem' }}>{p.chestNumber}</strong>
                              ) : (
                                <span style={{ color: 'red', fontSize: '0.8rem' }}>ഇല്ല (-)</span>
                              )}
                            </td>
                            <td>
                              <strong>{p.name}</strong>
                              {(() => {
                                const pViolations = conflictWarningMap[p.id];
                                if (!pViolations || pViolations.length === 0) return null;
                                return (
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentYrData = db?.years?.[currentYear] || { participants: [] };
                                      const issues = getParticipantConflictDetails(p, currentYrData);
                                      setConflictDetailsModal({
                                        show: true,
                                        participantName: p.name,
                                        parish: p.parish,
                                        category: AGE_GROUPS[calculateAgeGroup(p.dob)] || '-',
                                        issues: issues.length > 0 ? issues : (conflictWarningMap[p.id] || [])
                                      });
                                    }}
                                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '6px', cursor: 'pointer' }}
                                    title="നിയമ ലംഘന വിവരങ്ങൾ കാണാൻ ക്ലിക്ക് ചെയ്യുക"
                                  >
                                    ⚠️ നിയമ ലംഘനം
                                  </span>
                                );
                              })()}
                            </td>
                            <td>{p.houseName}</td>
                            <td>{p.parish}</td>
                            <td>{AGE_GROUPS[calculateAgeGroup(p.dob)] || '-'}</td>
                            <td>{p.gender === 'male' ? 'M' : 'F'}</td>
                            <td>
                              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '4px' }}>
                                {p.registeredItems.map(itemId => (
                                  <span key={itemId} style={{ fontSize: '0.75rem', backgroundColor: 'var(--bg-tertiary)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {getItemDisplayName(itemId)}
                                  </span>
                                ))}
                                {(p.registeredGroupItems || []).map(itemId => (
                                  <span key={itemId} style={{ fontSize: '0.75rem', backgroundColor: 'var(--gold-light)', color: 'var(--gold-color)', padding: '2px 6px', borderRadius: '4px' }}>
                                    {getItemDisplayName(itemId)} (G)
                                  </span>
                                ))}
                              </div>
                            </td>
                          </tr>
                        ))}
                        {liveChestManagementParticipants.length === 0 && (
                          <tr><td colSpan="7" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>മത്സരാർത്ഥികളെയൊന്നും കണ്ടെത്തിയില്ല.</td></tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowChestManagementModal(false)}>അടയ്ക്കുക (Close Window)</button>
            </div>
          </div>
        </div>
      )}

      {/* Clear Confirmation Warning Modal */}
      {confirmClearModal && (
        <div className="modal-overlay" style={{ zIndex: 1001 }}>
          <div className="modal-content" style={{ maxWidth: '480px' }}>
            <div className="modal-header" style={{ color: 'var(--accent-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <AlertTriangle size={22} />
                <span>തീരുമാനം സ്ഥിരീകരിക്കുക (Confirmation Warning)</span>
              </div>
              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  onClick={() => setConfirmClearModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="modal-body">
              <p style={{ fontWeight: 'bold', color: 'red' }}>
                {clearChestModal.mode === 'group_gender' || clearChestModal.mode === 'group_common' ? (
                  'തിരഞ്ഞെടുത്ത ഗ്രൂപ്പ് ഇനങ്ങളുടെ ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പറുകൾ പൂർണ്ണമായി ഒഴിവാക്കാൻ നിങ്ങൾക്ക് ഉറപ്പാണോ?'
                ) : (
                  'തിരഞ്ഞെടുത്ത മത്സരാർത്ഥികളുടെ ചെസ്റ്റ് നമ്പറുകൾ പൂർണ്ണമായി ഒഴിവാക്കാൻ നിങ്ങൾക്ക് ഉറപ്പാണോ?'
                )}
              </p>
              <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                {clearChestModal.mode === 'group_gender' || clearChestModal.mode === 'group_common' ? (
                  'ഈ ഗ്രൂപ്പ് ഇനങ്ങളിലെ ഗ്രൂപ്പ് ചെസ്റ്റ് നമ്പറുകൾ മാത്രമാണ് റദ്ദാക്കുന്നത്. മത്സരാർത്ഥികളുടെ വ്യക്തിഗത ചെസ്റ്റ് നമ്പറുകൾ മാറ്റമില്ലാതെ തുടരും.'
                ) : (
                  'ഈ പ്രവർത്തി തിരികെ ലഭിക്കില്ല. റദ്ദാക്കിയ ശേഷം ഓട്ടോമാറ്റിക് ആയോ നേരിട്ടോ പുതിയ ചെസ്റ്റ് നമ്പറുകൾ നൽകാം.'
                )}
              </p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setConfirmClearModal(false)}>റദ്ദാക്കുക (Cancel)</button>
              <button className="btn btn-danger" onClick={executeClearChestNumbers}>ഉറപ്പാണ്, റദ്ദാക്കുക (Yes, Clear)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- EDIT RESULT INLINE / COMPONENT MODAL --- */}
      {editResultModal.show && editResultModal.result && (
        <div className="modal-overlay" style={{ zIndex: 1002 }}>
          <div className="modal-content" style={{ maxWidth: '500px' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={22} />
                <span>ഫലം തിരുത്തുക (Edit Result)</span>
              </div>
              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  onClick={() => setEditResultModal({ show: false, result: null })}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>
            <form onSubmit={handleSaveEditedResult}>
              <div className="modal-body">
                <p style={{ marginBottom: '1rem', fontWeight: 'bold' }}>
                  ഇനം: {getItemDisplayName(editResultModal.result.itemName)} ({editResultModal.result.parish})
                </p>
                <div className="form-group" style={{ marginBottom: '1rem' }}>
                  <label className="form-label">സ്ഥാനം (Position)</label>
                  <select 
                    className="form-select"
                    value={editResultModal.result.position}
                    onChange={(e) => setEditResultModal({
                      ...editResultModal,
                      result: { ...editResultModal.result, position: e.target.value }
                    })}
                  >
                    <option value="1">1st Place (ഒന്നാം സ്ഥാനം)</option>
                    <option value="2">2nd Place (രണ്ടാം സ്ഥാനം)</option>
                    <option value="3">3rd Place (മൂന്നാം സ്ഥാനം)</option>
                    <option value="">None (സ്ഥാനമില്ല)</option>
                  </select>
                </div>

                <div className="form-group">
                  <label className="form-label">ഗ്രേഡ് (Grade)</label>
                  <select 
                    className="form-select"
                    value={editResultModal.result.grade}
                    onChange={(e) => setEditResultModal({
                      ...editResultModal,
                      result: { ...editResultModal.result, grade: e.target.value }
                    })}
                  >
                    <option value="A">A Grade</option>
                    <option value="B">B Grade</option>
                    <option value="C">C Grade</option>
                    <option value="">No Grade</option>
                  </select>
                </div>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-secondary" onClick={() => setEditResultModal({ show: false, result: null })}>റദ്ദാക്കുക</button>
                <button type="submit" className="btn btn-primary">സേവ് ചെയ്യുക (Save Changes)</button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* --- NEW DEDICATED MODAL WINDOW FOR FILTERING & EDITING RESULTS IN ENTER WINNERS PAGE --- */}
      {showEditResultsModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className={`modal-content ${isEditResultsMaximized ? 'maximized' : ''}`} style={isEditResultsMaximized ? {} : { maxWidth: '1200px', width: '95vw', maxHeight: '92vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Edit2 size={20} style={{ color: 'var(--primary-color)' }} />
                <span>മത്സരഫലങ്ങൾ ഫിൽട്ടർ ചെയ്ത് തിരുത്തുക / ഇല്ലാതാക്കുക (Edit & Delete Results)</span>
              </div>

              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn" 
                  title={isEditResultsMaximized ? "Restore Window" : "Maximize Window"}
                  onClick={() => setIsEditResultsMaximized(!isEditResultsMaximized)}
                >
                  {isEditResultsMaximized ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                      <path d="M1.5 3.5V10.5H8.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="0.5" />
                    </svg>
                  )}
                </button>
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  title="Close Window"
                  onClick={() => setShowEditResultsModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Comprehensive Filter & Search Header Controls */}
            <div className="results-filter-bar no-print" style={{ margin: '1rem 1rem 0.5rem 1rem', padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(170px, 1fr))', gap: '0.85rem', alignItems: 'end' }}>
              <div className="form-group">
                <label className="form-label">തിരച്ചിൽ (Search)</label>
                <div style={{ position: 'relative' }}>
                  <Search size={16} style={{ position: 'absolute', left: '10px', top: '10px', color: 'var(--text-muted)' }} />
                  <input 
                    type="text" 
                    className="form-input" 
                    style={{ paddingLeft: '32px', width: '100%' }}
                    placeholder="Name, Chest No, Parish..."
                    value={editResSearch}
                    onChange={(e) => setEditResSearch(e.target.value)}
                  />
                </div>
              </div>

              <div className="form-group">
                <label className="form-label">മത്സര തരം (Category Type)</label>
                <select 
                  className="form-select" 
                  value={editResCatTypeFilter} 
                  onChange={(e) => {
                    const newType = e.target.value;
                    setEditResCatTypeFilter(newType);
                    if (editResItemFilter) {
                      if (newType === 'sahithya' && !editResItemFilter.startsWith('s_')) setEditResItemFilter('');
                      if (newType === 'kalaa' && !editResItemFilter.startsWith('k_')) setEditResItemFilter('');
                    }
                  }}
                >
                  <option value="all">എല്ലാ മത്സരങ്ങളും (All)</option>
                  <option value="sahithya">സാഹിത്യ മത്സരം (Sahithya)</option>
                  <option value="kalaa">കലാ മത്സരം (Kalaa)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">മത്സര ഇനം (Item Filter)</label>
                <select 
                  className="form-select" 
                  value={editResItemFilter} 
                  onChange={(e) => setEditResItemFilter(e.target.value)}
                >
                  <option value="">എല്ലാ ഇനങ്ങളും (All Items)</option>
                  {itemsForEditResultsModalDropdown.map(item => (
                    <option key={item.id} value={item.id}>{item.name}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ഇടവക (Parish Filter)</label>
                <select 
                  className="form-select" 
                  value={editResParishFilter} 
                  onChange={(e) => setEditResParishFilter(e.target.value)}
                >
                  <option value="">എല്ലാ ഇടവകകളും (All Parishes)</option>
                  {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">പ്രായ വിഭാഗം (Age Category)</label>
                <select 
                  className="form-select" 
                  value={editResAgeFilter} 
                  onChange={(e) => setEditResAgeFilter(e.target.value)}
                >
                  <option value="">എല്ലാം (All Categories)</option>
                  {Object.entries(AGE_GROUPS).map(([k, v]) => (
                    <option key={k} value={k}>{v}</option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ജെൻഡർ (Gender)</label>
                <select 
                  className="form-select" 
                  value={editResGenderFilter} 
                  onChange={(e) => setEditResGenderFilter(e.target.value)}
                >
                  <option value="all">എല്ലാം (All)</option>
                  <option value="male">ആൺകുട്ടികൾ (Boys)</option>
                  <option value="female">പെൺകുട്ടികൾ (Girls)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ക്രമീകരിക്കുക (Sort By)</label>
                <select 
                  className="form-select" 
                  value={editResSortBy} 
                  onChange={(e) => setEditResSortBy(e.target.value)}
                >
                  <option value="position">സ്ഥാനം പ്രകാരം (Position)</option>
                  <option value="item">മത്സര ഇനം പ്രകാരം (Item)</option>
                  <option value="parish">ഇടവക പ്രകാരം (Parish)</option>
                  <option value="name">പേര് പ്രകാരം (Name)</option>
                </select>
              </div>
            </div>

            {/* Results Table inside Modal */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem 1rem' }}>
              <div style={{ marginBottom: '0.5rem', fontSize: '0.85rem', color: 'var(--text-muted)', fontWeight: 'bold' }}>
                കണ്ടെത്തിയ ഫലങ്ങൾ: {filteredEditResultsModalList.length} എണ്ണം
              </div>

              <div className="table-container">
                <table className="cml-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>ക്രമ നം.</th>
                      <th>മത്സര ഇനം (Item)</th>
                      <th>പ്രായ വിഭാഗം (Category)</th>
                      <th>ജെൻഡർ (Gender)</th>
                      <th style={{ textAlign: 'center' }}>സ്ഥാനം</th>
                      <th style={{ textAlign: 'center' }}>ചെസ്റ്റ് നം.</th>
                      <th>വിജയി (പേര് & വീട്ടുപേര്)</th>
                      <th>ഇടവക (Parish)</th>
                      <th style={{ textAlign: 'center' }}>ഗ്രേഡ്</th>
                      <th className="no-print" style={{ textAlign: 'center' }}>നടപടികൾ (Actions)</th>
                    </tr>
                  </thead>
                  <tbody>
                    {filteredEditResultsModalList.map((r, idx) => {
                      const p = participants.find(part => part.id === r.participantId);
                      const catKey = r.ageCategory || (p && p.dob ? calculateAgeGroup(p.dob) : '');
                      const catLabel = AGE_GROUPS[catKey] || catKey || '-';
                      const genderVal = r.gender || (p ? p.gender : '');
                      const genderLabel = (genderVal || '').toLowerCase() === 'male' ? 'ആൺകുട്ടികൾ' : (genderVal || '').toLowerCase() === 'female' ? 'പെൺകുട്ടികൾ' : '-';
                      const chestNo = r.chestNumber || (p ? p.chestNumber : '') || '-';
                      const winnerNameAndHouse = p 
                        ? `${p.name}${p.houseName ? ` (${p.houseName})` : ''}`
                        : 'ഗ്രൂപ്പ് ടീം';

                      return (
                        <tr key={r.id}>
                          <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td><strong>{getItemDisplayName(r.itemName)}</strong></td>
                          <td>{catLabel}</td>
                          <td>{genderLabel}</td>
                          <td style={{ textAlign: 'center' }}><strong>{r.position || '-'}</strong></td>
                          <td style={{ textAlign: 'center' }}>{chestNo}</td>
                          <td>
                            <strong>{winnerNameAndHouse}</strong>
                            {(() => {
                              if (!p) return null;
                              const pViolations = conflictWarningMap[p.id];
                              if (!pViolations || pViolations.length === 0) return null;
                              return (
                                <span 
                                  onClick={(e) => {
                                    e.stopPropagation();
                                    const currentYrData = db?.years?.[currentYear] || { participants: [] };
                                    const issues = getParticipantConflictDetails(p, currentYrData);
                                    setConflictDetailsModal({
                                      show: true,
                                      participantName: p.name,
                                      parish: p.parish,
                                      category: AGE_GROUPS[calculateAgeGroup(p.dob)] || '-',
                                      issues: issues.length > 0 ? issues : (conflictWarningMap[p.id] || [])
                                    });
                                  }}
                                  style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '6px', cursor: 'pointer' }}
                                  title="നിയമ ലംഘന വിവരങ്ങൾ കാണാൻ ക്ലിക്ക് ചെയ്യുക"
                                >
                                  ⚠️ നിയമ ലംഘനം
                                </span>
                              );
                            })()}
                          </td>
                          <td>{r.parish}</td>
                          <td style={{ textAlign: 'center' }}>{r.grade || '-'}</td>
                          <td className="no-print" style={{ textAlign: 'center' }}>
                            <div style={{ display: 'flex', gap: '6px', justifyContent: 'center' }}>
                              <button 
                                className="btn btn-secondary" 
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }} 
                                onClick={() => setEditResultModal({ show: true, result: { ...r } })}
                              >
                                <Edit2 size={14} /> തിരുത്തുക
                              </button>
                              <button 
                                className="btn btn-danger" 
                                style={{ padding: '4px 10px', fontSize: '0.8rem' }} 
                                onClick={() => handleDeleteResult(r.id)}
                              >
                                <Trash2 size={14} /> മായ്ക്കുക
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                    {filteredEditResultsModalList.length === 0 && (
                      <tr>
                        <td colSpan="10" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                          ഫിൽട്ടറുകൾക്കനുസരിച്ചുള്ള മത്സരഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowEditResultsModal(false)}>അടയ്ക്കുക (Close Window)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- WARNING MODAL --- */}
      {warningModal.show && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <ShieldAlert size={22} />
                <span>രജിസ്ട്രേഷൻ മുന്നറിയിപ്പ്!</span>
              </div>
              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  onClick={() => setWarningModal({ show: false, message: "", items: [] })}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>
            <div className="modal-body">
              <p>{warningModal.message}</p>
            </div>
            <div className="modal-footer">
              <button className="btn btn-primary" onClick={() => setWarningModal({ show: false, message: "", items: [] })}>ശരി (OK)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEDICATED MODAL WINDOW FOR VIEW & PRINT RESULTS --- */}
      {showResultsModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className={`modal-content ${isResultsMaximized ? 'maximized' : ''}`} style={isResultsMaximized ? {} : { maxWidth: '1200px', width: '95vw', maxHeight: '92vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <FileText size={20} style={{ color: 'var(--gold-color)' }} />
                <span>ചെറുപുഷ്പ മിഷൻ ലീഗ് മത്സരഫലങ്ങൾ (View & Print Results)</span>
              </div>

              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn" 
                  title={isResultsMaximized ? "Restore Window (കുറയ്ക്കുക)" : "Maximize Window (വലുതാക്കുക)"}
                  onClick={() => setIsResultsMaximized(!isResultsMaximized)}
                >
                  {isResultsMaximized ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                      <path d="M1.5 3.5V10.5H8.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="0.5" />
                    </svg>
                  )}
                </button>
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  title="Close Window (അടയ്ക്കുക)"
                  onClick={() => setShowResultsModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Main Operational Switcher & Exclusive Competition Category Toggle */}
            <div className="no-print" style={{ margin: '1rem 1rem 0 1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'flex', flexWrap: 'wrap', gap: '1rem', alignItems: 'center', justifyContent: 'space-between', border: '1px solid var(--border-color)' }}>
              {/* 1. Main Print Mode Switcher (Simple vs Multi-Select) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>പ്രിന്റ് മോഡ്:</span>
                <button 
                  type="button" 
                  className={`btn ${resFilterMode === 'simple' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 12px', fontSize: '0.82rem', fontWeight: 'bold' }}
                  onClick={() => {
                    setResFilterMode('simple');
                    setActiveResPopover(null);
                  }}
                >
                  സാധാരണ പ്രിന്റ് (Single Select)
                </button>
                <button 
                  type="button" 
                  className={`btn ${resFilterMode === 'multi' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 12px', fontSize: '0.82rem', fontWeight: 'bold' }}
                  onClick={() => {
                    setResFilterMode('multi');
                    setActiveResPopover(null);
                  }}
                >
                  മൾട്ടി സെലക്ഷൻ പ്രിന്റ് (Multi-Select)
                </button>
              </div>

              {/* 2. Exclusive Competition Category Switcher (Available in BOTH Simple & Multi modes!) */}
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', backgroundColor: 'var(--bg-primary)', padding: '4px 8px', borderRadius: 'var(--radius-md)', border: '1.5px solid var(--primary-color)' }}>
                <span style={{ fontSize: '0.82rem', fontWeight: 'bold', color: 'var(--primary-color)' }}>മത്സര തരം:</span>
                <button 
                  type="button" 
                  className={`btn ${resModalCategoryMode === 'sahithya' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                  onClick={() => {
                    setResModalCategoryMode('sahithya');
                    setResItemFilter('');
                    setResSelectedItems([]);
                  }}
                >
                  സാഹിത്യം
                </button>
                <button 
                  type="button" 
                  className={`btn ${resModalCategoryMode === 'kalaa' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                  onClick={() => {
                    setResModalCategoryMode('kalaa');
                    setResItemFilter('');
                    setResSelectedItems([]);
                  }}
                >
                  കല
                </button>
                <button 
                  type="button" 
                  className={`btn ${resModalCategoryMode === 'both' ? 'btn-primary' : 'btn-secondary'}`}
                  style={{ padding: '4px 10px', fontSize: '0.82rem' }}
                  onClick={() => {
                    setResModalCategoryMode('both');
                    setResItemFilter('');
                    setResSelectedItems([]);
                  }}
                >
                  രണ്ടും (Both)
                </button>
              </div>
            </div>

            {/* Filter Bar inside Modal */}
            <div className="results-filter-bar no-print" style={{ margin: '0.5rem 1rem 0.5rem 1rem', padding: '0.75rem 1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)' }}>
              {resFilterMode === 'simple' ? (
                <>
                  <div className="form-group">
                    <label className="form-label">ഇടവക (Select Parish)</label>
                    <select className="form-select" value={resParishFilter} onChange={(e) => setResParishFilter(e.target.value)}>
                      <option value="">എല്ലാ ഇടവകകളും (All Parishes)</option>
                      {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">പ്രായ വിഭാഗം (Age Category)</label>
                    <select className="form-select" value={resCategoryFilter} onChange={(e) => setResCategoryFilter(e.target.value)}>
                      <option value="">എല്ലാ വിഭാഗങ്ങളും (All Categories)</option>
                      {Object.entries(AGE_GROUPS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">
                      മത്സര ഇനം ({resModalCategoryMode === 'sahithya' ? 'Sahithya Only' : resModalCategoryMode === 'kalaa' ? 'Kalaa Only' : 'All Items'})
                    </label>
                    <select className="form-select" value={resItemFilter} onChange={(e) => setResItemFilter(e.target.value)}>
                      <option value="">
                        {resModalCategoryMode === 'sahithya' ? 'എല്ലാ സാഹിത്യ മത്സരങ്ങളും' : resModalCategoryMode === 'kalaa' ? 'എല്ലാ കലാ മത്സരങ്ങളും' : 'എല്ലാ മത്സരങ്ങളും (All)'}
                      </option>
                      {itemsForCascadedResultsDropdown.map(item => (
                        <option key={item.id} value={item.id}>{item.name}</option>
                      ))}
                    </select>
                  </div>

                  <div className="form-group">
                    <label className="form-label">ജെൻഡർ (Gender)</label>
                    <select className="form-select" value={resGenderFilter} onChange={(e) => setResGenderFilter(e.target.value)}>
                      <option value="all">എല്ലാ ജെൻഡറുകളും (All Genders)</option>
                      <option value="male">ആൺകുട്ടികൾ (Boys)</option>
                      <option value="female">പെൺകുട്ടികൾ (Girls)</option>
                    </select>
                  </div>
                </>
              ) : (
                <>
                  {/* Multi-Select Parish */}
                  {(() => {
                    const options = PARISHES.map(p => ({ id: p, name: p }));
                    const isOpen = activeResPopover === 'parish';
                    const isAll = resSelectedParishes.length === 0;
                    return (
                      <div className="form-group" style={{ position: 'relative', minWidth: '170px' }}>
                        <label className="form-label">ഇടവക (Multi-Select)</label>
                        <button
                          type="button"
                          className="form-select"
                          style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}
                          onClick={() => setActiveResPopover(isOpen ? null : 'parish')}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
                            {isAll ? 'എല്ലാ ഇടവകകളും' : (resSelectedParishes.length === 1 ? resSelectedParishes[0] : `${resSelectedParishes.length} ഇടവകകൾ`)}
                          </span>
                          <ChevronDown size={14} />
                        </button>
                        {isOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1005, maxHeight: '230px', overflowY: 'auto', padding: '6px', marginTop: '2px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                              <input type="checkbox" checked={isAll} onChange={() => setResSelectedParishes([])} />
                              <span>[✓] എല്ലാ ഇടവകകളും (All)</span>
                            </label>
                            {options.map(opt => (
                              <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                                <input 
                                  type="checkbox" 
                                  checked={resSelectedParishes.includes(opt.id)} 
                                  onChange={() => {
                                    if (resSelectedParishes.includes(opt.id)) {
                                      setResSelectedParishes(resSelectedParishes.filter(x => x !== opt.id));
                                    } else {
                                      setResSelectedParishes([...resSelectedParishes, opt.id]);
                                    }
                                  }} 
                                />
                                <span>{opt.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Multi-Select Category */}
                  {(() => {
                    const options = Object.entries(AGE_GROUPS).map(([k, v]) => ({ id: k, name: v }));
                    const isOpen = activeResPopover === 'category';
                    const isAll = resSelectedCategories.length === 0;
                    return (
                      <div className="form-group" style={{ position: 'relative', minWidth: '170px' }}>
                        <label className="form-label">വിഭാഗം (Multi-Select)</label>
                        <button
                          type="button"
                          className="form-select"
                          style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}
                          onClick={() => setActiveResPopover(isOpen ? null : 'category')}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '130px' }}>
                            {isAll ? 'എല്ലാ വിഭാഗങ്ങളും' : (resSelectedCategories.length === 1 ? (AGE_GROUPS_SHORT_ENG[resSelectedCategories[0]] || resSelectedCategories[0]) : `${resSelectedCategories.length} വിഭാഗങ്ങൾ`)}
                          </span>
                          <ChevronDown size={14} />
                        </button>
                        {isOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1005, maxHeight: '230px', overflowY: 'auto', padding: '6px', marginTop: '2px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                              <input type="checkbox" checked={isAll} onChange={() => setResSelectedCategories([])} />
                              <span>[✓] എല്ലാ വിഭാഗങ്ങളും (All)</span>
                            </label>
                            {options.map(opt => (
                              <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                                <input 
                                  type="checkbox" 
                                  checked={resSelectedCategories.includes(opt.id)} 
                                  onChange={() => {
                                    if (resSelectedCategories.includes(opt.id)) {
                                      setResSelectedCategories(resSelectedCategories.filter(x => x !== opt.id));
                                    } else {
                                      setResSelectedCategories([...resSelectedCategories, opt.id]);
                                    }
                                  }} 
                                />
                                <span>{opt.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Multi-Select Items */}
                  {(() => {
                    const isOpen = activeResPopover === 'item';
                    const isAll = resSelectedItems.length === 0;
                    return (
                      <div className="form-group" style={{ position: 'relative', minWidth: '190px' }}>
                        <label className="form-label">
                          മത്സര ഇനം ({resModalCategoryMode === 'sahithya' ? 'Sahithya Only' : resModalCategoryMode === 'kalaa' ? 'Kalaa Only' : 'All Items'})
                        </label>
                        <button
                          type="button"
                          className="form-select"
                          style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}
                          onClick={() => setActiveResPopover(isOpen ? null : 'item')}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '150px' }}>
                            {isAll ? (resModalCategoryMode === 'sahithya' ? 'എല്ലാ സാഹിത്യ മത്സരങ്ങളും' : resModalCategoryMode === 'kalaa' ? 'എല്ലാ കലാ മത്സരങ്ങളും' : 'എല്ലാ മത്സരങ്ങളും') : (resSelectedItems.length === 1 ? getItemDisplayName(resSelectedItems[0]) : `${resSelectedItems.length} ഇനങ്ങൾ`)}
                          </span>
                          <ChevronDown size={14} />
                        </button>
                        {isOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1005, maxHeight: '230px', overflowY: 'auto', padding: '6px', marginTop: '2px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                              <input type="checkbox" checked={isAll} onChange={() => setResSelectedItems([])} />
                              <span>[✓] എല്ലാ ഇനങ്ങളും (All)</span>
                            </label>
                            {itemsForCascadedResultsDropdown.map(opt => (
                              <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                                <input 
                                  type="checkbox" 
                                  checked={resSelectedItems.includes(opt.id)} 
                                  onChange={() => {
                                    if (resSelectedItems.includes(opt.id)) {
                                      setResSelectedItems(resSelectedItems.filter(x => x !== opt.id));
                                    } else {
                                      setResSelectedItems([...resSelectedItems, opt.id]);
                                    }
                                  }} 
                                />
                                <span>{opt.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}

                  {/* Multi-Select Gender */}
                  {(() => {
                    const options = [{ id: 'male', name: 'ആൺകുട്ടികൾ (Boys)' }, { id: 'female', name: 'പെൺകുട്ടികൾ (Girls)' }];
                    const isOpen = activeResPopover === 'gender';
                    const isAll = resSelectedGenders.length === 0;
                    return (
                      <div className="form-group" style={{ position: 'relative', minWidth: '150px' }}>
                        <label className="form-label">ജെൻഡർ (Multi-Select)</label>
                        <button
                          type="button"
                          className="form-select"
                          style={{ textAlign: 'left', display: 'flex', justifyContent: 'space-between', alignItems: 'center', cursor: 'pointer', backgroundColor: 'var(--bg-primary)' }}
                          onClick={() => setActiveResPopover(isOpen ? null : 'gender')}
                        >
                          <span style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '120px' }}>
                            {isAll ? 'എല്ലാ ജെൻഡറുകളും' : (resSelectedGenders.length === 1 ? (resSelectedGenders[0] === 'male' ? 'Boys' : 'Girls') : `${resSelectedGenders.length} ജെൻഡറുകൾ`)}
                          </span>
                          <ChevronDown size={14} />
                        </button>
                        {isOpen && (
                          <div style={{ position: 'absolute', top: '100%', left: 0, right: 0, backgroundColor: 'var(--bg-primary)', border: '2px solid var(--primary-color)', borderRadius: 'var(--radius-md)', boxShadow: 'var(--shadow-lg)', zIndex: 1005, maxHeight: '230px', overflowY: 'auto', padding: '6px', marginTop: '2px' }}>
                            <label style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '6px 8px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', borderBottom: '1px solid var(--border-color)', backgroundColor: 'var(--bg-tertiary)' }}>
                              <input type="checkbox" checked={isAll} onChange={() => setResSelectedGenders([])} />
                              <span>[✓] എല്ലാ ജെൻഡറുകളും (All)</span>
                            </label>
                            {options.map(opt => (
                              <label key={opt.id} style={{ display: 'flex', alignItems: 'center', gap: '8px', padding: '5px 8px', fontSize: '0.85rem', cursor: 'pointer', borderBottom: '1px solid var(--border-color)' }}>
                                <input 
                                  type="checkbox" 
                                  checked={resSelectedGenders.includes(opt.id)} 
                                  onChange={() => {
                                    if (resSelectedGenders.includes(opt.id)) {
                                      setResSelectedGenders(resSelectedGenders.filter(x => x !== opt.id));
                                    } else {
                                      setResSelectedGenders([...resSelectedGenders, opt.id]);
                                    }
                                  }} 
                                />
                                <span>{opt.name}</span>
                              </label>
                            ))}
                          </div>
                        )}
                      </div>
                    );
                  })()}
                </>
              )}

              <div className="form-group" style={{ gridColumn: 'span 2' }}>
                <label className="form-label">6. പ്രിന്റ് ക്രമീകരണം (Print Options)</label>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'var(--card-bg)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79, 70, 229, 0.25)', minHeight: '38px' }}>
                    <input 
                      type="checkbox" 
                      checked={incRegSlNoInResultsPrint} 
                      onChange={(e) => setIncRegSlNoInResultsPrint(e.target.checked)} 
                    />
                    <span>അംഗത്വ ലിസ്റ്റ് ക്രമ നമ്പർ</span>
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'var(--card-bg)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79, 70, 229, 0.25)', minHeight: '38px' }}>
                    <input 
                      type="checkbox" 
                      checked={incMemNoInResultsPrint} 
                      onChange={(e) => setIncMemNoInResultsPrint(e.target.checked)} 
                    />
                    <span>അംഗത്വ നമ്പർ</span>
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.85rem', fontWeight: 'bold', cursor: 'pointer', backgroundColor: 'var(--card-bg)', padding: '6px 12px', borderRadius: 'var(--radius-sm)', border: '1px solid rgba(79, 70, 229, 0.25)', minHeight: '38px' }}>
                    <input 
                      type="checkbox" 
                      checked={incChestNoInResultsPrint} 
                      onChange={(e) => setIncChestNoInResultsPrint(e.target.checked)} 
                    />
                    <span>ചെസ്റ്റ് നമ്പർ</span>
                  </label>
                </div>
              </div>

              <div className="form-group" style={{ justifySelf: 'end' }}>
                <button type="button" className="btn btn-primary" style={{ padding: '8px 16px', fontWeight: 'bold' }} onClick={() => handlePrintMasterResults('print')}>
                  <Printer size={16} /> പ്രിന്റ് ചെയ്യുക
                </button>
                <button type="button" className="btn" style={{ backgroundColor: '#059669', color: '#ffffff', padding: '8px 16px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }} onClick={() => handlePrintMasterResults('pdf')}>
                  <Download size={16} /> PDF സേവ് ചെയ്യുക
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem 1rem' }}>
              <div className="table-container">
                <table className="cml-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>ക്രമ നം.</th>
                      <th>മത്സര ഇനം (Item)</th>
                      <th style={{ textAlign: 'center' }}>വിഭാഗം (Category)</th>
                      <th>
                        <div>പേര് (Name)</div>
                        <div style={{ fontWeight: 'normal', fontSize: '0.85em', opacity: 0.85 }}>വീട്ടുപേര് (House Name)</div>
                      </th>
                      <th>ഇടവക (Parish)</th>
                      <th style={{ textAlign: 'center' }}>സ്ഥാനം</th>
                      <th style={{ textAlign: 'center' }}>ഗ്രേഡ്</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {filteredResultsMaster.map((r, idx) => {
                      const p = participants.find(part => part.id === r.participantId);
                      const ageGroupKey = r.ageCategory || (p ? calculateAgeGroup(p.dob) : null);
                      const baseAgeGroup = ageGroupKey ? (AGE_GROUPS_SHORT_ENG[ageGroupKey] || AGE_GROUPS[ageGroupKey] || ageGroupKey) : '-';
                      const genderVal = r.gender || (p ? p.gender : null);
                      const genderLabel = genderVal === 'male' ? 'Male' : (genderVal === 'female' ? 'Female' : (r.itemType === 'group' ? 'Group' : ''));
                      const isGroupItem = r.itemType === 'group' || !r.participantId;
                      const ageGroupText = isGroupItem ? '-' : (genderLabel && baseAgeGroup !== '-' ? `${baseAgeGroup} (${genderLabel})` : baseAgeGroup);
                      const pts = calculateResultPoints(r);

                      return (
                        <tr key={r.id}>
                          <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td><strong>{getItemDisplayName(r.itemName)}</strong></td>
                          <td style={{ textAlign: 'center' }}>{ageGroupText}</td>
                          <td>
                            <div>
                              <strong>{p ? p.name : 'ഗ്രൂപ്പ് ടീം'}</strong>
                              {(() => {
                                if (!p) return null;
                                const pViolations = conflictWarningMap[p.id];
                                if (!pViolations || pViolations.length === 0) return null;
                                return (
                                  <span 
                                    onClick={(e) => {
                                      e.stopPropagation();
                                      const currentYrData = db?.years?.[currentYear] || { participants: [] };
                                      const issues = getParticipantConflictDetails(p, currentYrData);
                                      setConflictDetailsModal({
                                        show: true,
                                        participantName: p.name,
                                        parish: p.parish,
                                        category: AGE_GROUPS[calculateAgeGroup(p.dob)] || '-',
                                        issues: issues.length > 0 ? issues : (conflictWarningMap[p.id] || [])
                                      });
                                    }}
                                    style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '6px', cursor: 'pointer' }}
                                    title="നിയമ ലംഘന വിവരങ്ങൾ കാണാൻ ക്ലിക്ക് ചെയ്യുക"
                                  >
                                    ⚠️ നിയമ ലംഘനം
                                  </span>
                                );
                              })()}
                            </div>
                            {p && p.houseName && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.houseName}</div>}
                          </td>
                          <td>{r.parish}</td>
                          <td style={{ textAlign: 'center' }}><strong>{r.position || '-'}</strong></td>
                          <td style={{ textAlign: 'center' }}>{r.grade || '-'}</td>
                          
                        </tr>
                      );
                    })}
                    {filteredResultsMaster.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '1.5rem' }}>
                          തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾക്കനുസരിച്ചുള്ള മത്സരഫലങ്ങളൊന്നും കണ്ടെത്തിയില്ല.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 'bold', color: 'var(--accent-color)' }}>
                ആകെ പോയിന്റ് (Total Points): <span style={{ fontSize: '1.15rem' }}>{totalSelectedPoints}</span>
              </div>
              <button className="btn btn-secondary" onClick={() => setShowResultsModal(false)}>അടയ്ക്കുക (Close Window)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEDICATED MODAL WINDOW FOR RUPATHA COMPETITION (1st & 2nd WINNERS) --- */}
      {showRupathaModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className={`modal-content ${isRupathaMaximized ? 'maximized' : ''}`} style={isRupathaMaximized ? {} : { maxWidth: '1200px', width: '95vw', maxHeight: '92vh' }}>
            <div className="modal-header" style={{ backgroundColor: '#7c3aed', color: '#ffffff' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Trophy size={22} style={{ color: '#fef08a' }} />
                <span style={{ fontWeight: 'bold', fontSize: '1.1rem' }}>രൂപത മത്സരം (Rupatha Competition - 1st & 2nd Winners)</span>
              </div>

              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn" 
                  style={{ color: '#ffffff' }}
                  title={isRupathaMaximized ? "Restore Window" : "Maximize Window"}
                  onClick={() => setIsRupathaMaximized(!isRupathaMaximized)}
                >
                  {isRupathaMaximized ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                      <path d="M1.5 3.5V10.5H8.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="0.5" />
                    </svg>
                  )}
                </button>
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  style={{ color: '#ffffff' }}
                  title="Close Window"
                  onClick={() => setShowRupathaModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            {/* Filter and Sorting Options Bar */}
            <div className="no-print" style={{ margin: '1rem 1rem 0 1rem', padding: '1rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)' }}>
              <div style={{ fontSize: '0.88rem', fontWeight: 'bold', color: '#7c3aed', marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Filter size={16} /> രൂപത മത്സര വിജയികളുടെ പട്ടിക ക്രമീകരിക്കാനും ഫിൽട്ടർ ചെയ്യാനും (Sort & Filter 1st & 2nd Winners):
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.75rem', alignItems: 'end' }}>
                {/* Sahithya / Kalaa Mode */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>വിഭാഗ തരം (Type)</label>
                  <select className="form-select" value={rupathaTypeMode} onChange={(e) => setRupathaTypeMode(e.target.value)}>
                    <option value="both">രണ്ടും (Sahithya & Kalaa)</option>
                    <option value="sahithya">സാഹിത്യം മാത്രം</option>
                    <option value="kalaa">കല മാത്രം</option>
                  </select>
                </div>

                {/* Parish Filter */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ഇടവക (Parish)</label>
                  <select className="form-select" value={rupathaParishFilter} onChange={(e) => setRupathaParishFilter(e.target.value)}>
                    <option value="">എല്ലാ ഇടവകകളും (All)</option>
                    {PARISHES.map(p => (
                      <option key={p} value={p}>{p}</option>
                    ))}
                  </select>
                </div>

                {/* Age Category Filter */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>വിഭാഗം (Age Group)</label>
                  <select className="form-select" value={rupathaCategoryFilter} onChange={(e) => setRupathaCategoryFilter(e.target.value)}>
                    <option value="">എല്ലാ വിഭാഗങ്ങളും (All)</option>
                    {Object.entries(AGE_GROUPS).map(([catKey, label]) => (
                      <option key={catKey} value={catKey}>{label}</option>
                    ))}
                  </select>
                </div>

                {/* Item Filter */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>മത്സര ഇനം (Item)</label>
                  <select className="form-select" value={rupathaItemFilter} onChange={(e) => setRupathaItemFilter(e.target.value)}>
                    <option value="">എല്ലാ ഇനങ്ങളും (All)</option>
                    {Object.entries(ITEM_NAMES_MAP)
                      .filter(([id]) => {
                        if (rupathaTypeMode === 'sahithya') return id.startsWith('s_');
                        if (rupathaTypeMode === 'kalaa') return id.startsWith('k_');
                        return true;
                      })
                      .map(([id, nameMl]) => (
                        <option key={id} value={id}>{nameMl}</option>
                      ))}
                  </select>
                </div>

                {/* Gender Filter */}
                <div className="form-group" style={{ margin: 0 }}>
                  <label className="form-label" style={{ fontSize: '0.8rem', fontWeight: 'bold' }}>ജെൻഡർ (Gender)</label>
                  <select className="form-select" value={rupathaGenderFilter} onChange={(e) => setRupathaGenderFilter(e.target.value)}>
                    <option value="">എല്ലാ ജെൻഡറുകളും (All)</option>
                    <option value="male">ആൺകുട്ടി (Male)</option>
                    <option value="female">പെൺകുട്ടി (Female)</option>
                  </select>
                </div>
              </div>

              {/* Print Column Toggles & Reset */}
              <div style={{ marginTop: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '0.75rem' }}>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap', alignItems: 'center' }}>
                  <span style={{ fontSize: '0.8rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>പ്രിന്റ് കോളങ്ങൾ:</span>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input type="checkbox" checked={incRegSlNoInRupathaPrint} onChange={(e) => setIncRegSlNoInRupathaPrint(e.target.checked)} />
                    <span>ലിസ്റ്റ് നമ്പർ</span>
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input type="checkbox" checked={incMemNoInRupathaPrint} onChange={(e) => setIncMemNoInRupathaPrint(e.target.checked)} />
                    <span>അംഗത്വ നമ്പർ</span>
                  </label>
                  <label style={{ display: 'inline-flex', alignItems: 'center', gap: '6px', fontSize: '0.82rem', fontWeight: 'bold', cursor: 'pointer' }}>
                    <input type="checkbox" checked={incChestNoInRupathaPrint} onChange={(e) => setIncChestNoInRupathaPrint(e.target.checked)} />
                    <span>ചെസ്റ്റ് നമ്പർ</span>
                  </label>
                </div>

                <button 
                  type="button" 
                  className="btn btn-secondary" 
                  style={{ padding: '4px 10px', fontSize: '0.8rem' }}
                  onClick={() => {
                    setRupathaParishFilter("");
                    setRupathaCategoryFilter("");
                    setRupathaItemFilter("");
                    setRupathaGenderFilter("");
                    setRupathaTypeMode("both");
                  }}
                >
                  ഫിൽട്ടറുകൾ മായ്ക്കുക (Reset Filters)
                </button>
              </div>
            </div>

            {/* Modal Table Body */}
            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1rem' }}>
              <div style={{ marginBottom: '0.75rem', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <span style={{ fontSize: '0.9rem', fontWeight: 'bold', color: 'var(--text-muted)' }}>
                  കണ്ടെത്തിയ രൂപത മത്സരാർത്ഥികൾ (1st & 2nd Winners): <strong style={{ color: '#7c3aed', fontSize: '1.05rem' }}>{rupathaResultsList.length}</strong> എണ്ണം
                </span>
                <span style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  (ഒന്നാം സ്ഥാനം: <strong>{rupathaResultsList.filter(r => r.position === '1').length}</strong> &bull; രണ്ടാം സ്ഥാനം: <strong>{rupathaResultsList.filter(r => r.position === '2').length}</strong>)
                </span>
              </div>

              <div className="table-container">
                <table className="cml-table">
                  <thead>
                    <tr>
                      <th style={{ textAlign: 'center' }}>ക്രമ നം.</th>
                      <th>മത്സര ഇനം (Item)</th>
                      <th style={{ textAlign: 'center' }}>വിഭാഗം (Category)</th>
                      <th>
                        <div>പേര് (Name)</div>
                        <div style={{ fontWeight: 'normal', fontSize: '0.85em', opacity: 0.85 }}>വീട്ടുപേര് (House Name)</div>
                      </th>
                      <th>ഇടവക (Parish)</th>
                      <th style={{ textAlign: 'center' }}>സ്ഥാനം</th>
                      <th style={{ textAlign: 'center' }}>ഗ്രേഡ്</th>
                      
                    </tr>
                  </thead>
                  <tbody>
                    {rupathaResultsList.map((r, idx) => {
                      const isGroupItem = r.itemType === 'group' || !r.participantId;
                      const p = participants.find(part => part.id === r.participantId);
                      const ageCategoryKey = r.ageCategory || (p ? calculateAgeGroup(p.dob) : null);
                      const baseAgeGroup = ageCategoryKey ? (AGE_GROUPS_SHORT_ENG[ageCategoryKey] || AGE_GROUPS[ageCategoryKey] || ageCategoryKey) : '-';
                      const genderVal = r.gender || (p ? p.gender : null);
                      const genderLabel = genderVal === 'male' ? 'Male' : (genderVal === 'female' ? 'Female' : '');
                      const ageGroupText = isGroupItem ? '-' : (genderLabel && baseAgeGroup !== '-' ? `${baseAgeGroup} (${genderLabel})` : baseAgeGroup);
                      const isFirst = r.position === '1';

                      return (
                        <tr key={r.id} style={{ backgroundColor: isFirst ? 'rgba(254, 243, 199, 0.3)' : 'inherit' }}>
                          <td style={{ textAlign: 'center' }}>{idx + 1}</td>
                          <td><strong>{getItemDisplayName(r.itemName)}</strong></td>
                          <td style={{ textAlign: 'center' }}>{ageGroupText}</td>
                          <td>
                            <div><strong>{p ? p.name : (r.name || 'ഗ്രൂപ്പ് ടീം')}</strong></div>
                            {p && p.houseName && <div style={{ fontSize: '0.85rem', color: 'var(--text-muted)' }}>{p.houseName}</div>}
                          </td>
                          <td>{r.parish}</td>
                          <td style={{ textAlign: 'center' }}>
                            <span style={{ 
                              padding: '2px 8px', 
                              borderRadius: '12px', 
                              fontWeight: 'bold', 
                              fontSize: '0.85rem',
                              backgroundColor: isFirst ? '#fef3c7' : '#e2e8f0', 
                              color: isFirst ? '#b45309' : '#475569' 
                            }}>
                              {r.position === '1' ? '1st Rank' : '2nd Rank'}
                            </span>
                          </td>
                          <td style={{ textAlign: 'center' }}>{r.grade || '-'}</td>
                        </tr>
                      );
                    })}
                    {rupathaResultsList.length === 0 && (
                      <tr>
                        <td colSpan="8" style={{ textAlign: 'center', color: 'var(--text-muted)', padding: '2rem' }}>
                          തിരഞ്ഞെടുത്ത ഫിൽട്ടറുകൾക്കനുസരിച്ചുള്ള രൂപത മത്സര വിജയികളെ (1st & 2nd) ഒന്നും കണ്ടെത്തിയില്ല.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            {/* Modal Footer with Direct Print & Save PDF Actions */}
            <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
              <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
                <button 
                  type="button" 
                  className="btn btn-primary" 
                  style={{ padding: '9px 18px', fontWeight: 'bold', backgroundColor: '#7c3aed', borderColor: '#7c3aed', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handlePrintRupathaResults('print')}
                >
                  <Printer size={18} /> പ്രിന്റ് ചെയ്യുക (Print Directly)
                </button>
                <button 
                  type="button" 
                  className="btn" 
                  style={{ backgroundColor: '#059669', color: '#ffffff', padding: '9px 18px', fontWeight: 'bold', display: 'flex', alignItems: 'center', gap: '6px' }}
                  onClick={() => handlePrintRupathaResults('pdf')}
                >
                  <Download size={18} /> PDF സേവ് ചെയ്യുക (Save as PDF)
                </button>
              </div>

              <button className="btn btn-secondary" onClick={() => setShowRupathaModal(false)}>അടയ്ക്കുക (Close Window)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEDICATED MODAL WINDOW FOR MASTER PARTICIPANT IDs --- */}
      {showMasterIdModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className={`modal-content ${isMasterIdMaximized ? 'maximized' : ''}`} style={isMasterIdMaximized ? {} : { maxWidth: '1150px', width: '95vw', maxHeight: '90vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <Key size={20} style={{ color: 'var(--primary-color)' }} />
                <span>ചെറുപുഷ്പ മിഷൻ ലീഗ് മാസ്റ്റർ ഐഡി പട്ടിക (Participants Master ID)</span>
              </div>

              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn" 
                  title={isMasterIdMaximized ? "Restore Window (കുറയ്ക്കുക)" : "Maximize Window (വലുതാക്കുക)"}
                  onClick={() => setIsMasterIdMaximized(!isMasterIdMaximized)}
                >
                  {isMasterIdMaximized ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                      <path d="M1.5 3.5V10.5H8.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="0.5" />
                    </svg>
                  )}
                </button>
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  title="Close Window (അടയ്ക്കുക)"
                  onClick={() => setShowMasterIdModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="results-filter-bar no-print" style={{ margin: '1rem 1rem 0.5rem 1rem', padding: '0.85rem 1.25rem', backgroundColor: 'var(--bg-tertiary)', borderRadius: 'var(--radius-md)', display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '0.85rem' }}>
              <div className="form-group">
                <label className="form-label">ഇടവക (Parish Filter)</label>
                <select className="form-select" value={masterIdParishFilter} onChange={(e) => setMasterIdParishFilter(e.target.value)}>
                  <option value="">എല്ലാ ഇടവകകളും (All)</option>
                  {PARISHES.map(p => <option key={p} value={p}>{p}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">വിഭാഗം (Category Filter)</label>
                <select className="form-select" value={masterIdCatFilter} onChange={(e) => setMasterIdCatFilter(e.target.value)}>
                  <option value="">എല്ലാ വിഭാഗങ്ങളും (All)</option>
                  {Object.entries(AGE_GROUPS).map(([k, v]) => <option key={k} value={k}>{v}</option>)}
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ജെൻഡർ (Gender Filter)</label>
                <select className="form-select" value={masterIdGenderFilter} onChange={(e) => setMasterIdGenderFilter(e.target.value)}>
                  <option value="">എല്ലാം (All)</option>
                  <option value="male">ആൺകുട്ടികൾ (Male)</option>
                  <option value="female">പെൺകുട്ടികൾ (Female)</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label">ക്രമീകരിക്കുക (Sort By)</label>
                <select className="form-select" value={masterIdSortBy} onChange={(e) => setMasterIdSortBy(e.target.value)}>
                  <option value="masterId">മാസ്റ്റർ ഐഡി പ്രകാരം (Master ID)</option>
                  <option value="name">പേര് പ്രകാരം (Name)</option>
                  <option value="parish">ഇടവക പ്രകാരം (Parish)</option>
                </select>
              </div>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '0 1rem 1rem 1rem' }}>
              <div className="table-container">
                <table className="cml-table">
                  <thead>
                    <tr>
                      <th>മാസ്റ്റർ ഐഡി (Master ID)</th>
                      <th>പേര് (Name)</th>
                      <th>വീട്ടുപേര് (House Name)</th>
                      <th>ഇടവക (Parish)</th>
                      <th>വിഭാഗം (Category)</th>
                      <th>ജെൻഡർ</th>
                    </tr>
                  </thead>
                  <tbody>
                    {masterIdParticipantsList.map(p => (
                      <tr key={p.id}>
                        <td><strong style={{ color: 'var(--primary-color)' }}>{p.masterId || 'PID-1000'}</strong></td>
                        <td>
                          <strong>{p.name}</strong>
                          {(() => {
                            const pViolations = conflictWarningMap[p.id];
                            if (!pViolations || pViolations.length === 0) return null;
                            return (
                              <span 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  const currentYrData = db?.years?.[currentYear] || { participants: [] };
                                  const issues = getParticipantConflictDetails(p, currentYrData);
                                  setConflictDetailsModal({
                                    show: true,
                                    participantName: p.name,
                                    parish: p.parish,
                                    category: AGE_GROUPS[calculateAgeGroup(p.dob)] || '-',
                                    issues: issues.length > 0 ? issues : (conflictWarningMap[p.id] || [])
                                  });
                                }}
                                style={{ backgroundColor: 'rgba(239, 68, 68, 0.15)', color: 'var(--accent-color)', border: '1px solid var(--accent-color)', padding: '2px 6px', borderRadius: '4px', fontSize: '0.75rem', fontWeight: 'bold', marginLeft: '6px', cursor: 'pointer' }}
                                title="നിയമ ലംഘന വിവരങ്ങൾ കാണാൻ ക്ലിക്ക് ചെയ്യുക"
                              >
                                ⚠️ നിയമ ലംഘനം
                              </span>
                            );
                          })()}
                        </td>
                        <td>{p.houseName}</td>
                        <td>{p.parish}</td>
                        <td>{AGE_GROUPS[calculateAgeGroup(p.dob)] || '-'}</td>
                        <td>{p.gender === 'male' ? 'Male' : 'Female'}</td>
                      </tr>
                    ))}
                    {masterIdParticipantsList.length === 0 && (
                      <tr><td colSpan="6" style={{ textAlign: 'center', color: 'var(--text-muted)' }}>മത്സരാർത്ഥികളൊന്നും കാണാനില്ല.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowMasterIdModal(false)}>അടയ്ക്കുക (Close Window)</button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEDICATED MODAL WINDOW FOR MERGING DUPLICATE PARTICIPANTS --- */}
      {showMergeModal && (
        <div className="modal-overlay" style={{ zIndex: 999 }}>
          <div className={`modal-content ${isMergeMaximized ? 'maximized' : ''}`} style={isMergeMaximized ? {} : { maxWidth: '850px', width: '90vw', maxHeight: '85vh' }}>
            <div className="modal-header">
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                <GitMerge size={20} style={{ color: 'var(--accent-color)' }} />
                <span>ഡൂപ്ലിക്കേറ്റ് മത്സരാർത്ഥികളെ ലയിപ്പിക്കുക (Merge Participants)</span>
              </div>

              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn" 
                  title={isMergeMaximized ? "Restore Window" : "Maximize Window"}
                  onClick={() => setIsMergeMaximized(!isMergeMaximized)}
                >
                  {isMergeMaximized ? (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="3.5" y="1.5" width="7" height="7" rx="0.5" />
                      <path d="M1.5 3.5V10.5H8.5" />
                    </svg>
                  ) : (
                    <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                      <rect x="1.5" y="1.5" width="9" height="9" rx="0.5" />
                    </svg>
                  )}
                </button>
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  title="Close Window"
                  onClick={() => setShowMergeModal(false)}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ flex: 1, overflowY: 'auto', padding: '1.25rem' }}>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '1rem', borderRadius: 'var(--radius-md)', marginBottom: '1.5rem' }}>
                <p style={{ margin: '0 0 0.5rem 0', fontWeight: 'bold', color: 'var(--primary-color)' }}>
                  💡 നിർദ്ദേശം:
                </p>
                <p style={{ margin: 0, fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  അക്ഷരത്തെറ്റ് കാരണം അബദ്ധത്തിൽ രണ്ടുതവണ രജിസ്റ്റർ ചെയ്ത മത്സരാർത്ഥികളുടെ പ്രൊഫൈലുകൾ ഒന്നാക്കി മാറ്റാൻ ഈ ടൂൾ ഉപയോഗിക്കാം. ആദ്യത്തെ പ്രൊഫൈലിലെയും രണ്ടാമത്തെ പ്രൊഫൈലിലെയും എല്ലാ മത്സര ഇനങ്ങളും പോയിന്റുകളും ഒറ്റ പ്രൊഫൈലിലേക്ക് ലയിപ്പിക്കപ്പെടും.
                </p>
              </div>

              <div className="form-grid" style={{ marginBottom: '1.5rem' }}>
                {/* Source Selection (Typo Candidate) */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ color: 'red', fontWeight: 'bold' }}>
                    1. അബദ്ധത്തിൽ ഉണ്ടായ ഡൂപ്ലിക്കേറ്റ് പ്രൊഫൈൽ (Source Candidate - To be Merged & Removed) *
                  </label>
                  <select 
                    className="form-select"
                    value={mergeSourceId}
                    onChange={(e) => setMergeSourceId(e.target.value)}
                  >
                    <option value="">മത്സരാർത്ഥിയെ തിരഞ്ഞെടുക്കുക</option>
                    {participants.map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.houseName}) - {p.parish} | Chest: {p.chestNumber || '-'} | Master: {p.masterId}
                      </option>
                    ))}
                  </select>
                </div>

                {/* Target Selection (Correct Candidate Profile) */}
                <div className="form-group" style={{ gridColumn: 'span 2' }}>
                  <label className="form-label" style={{ color: 'var(--primary-color)', fontWeight: 'bold' }}>
                    2. നിലനിർത്തേണ്ട ശരിയായ പ്രൊഫൈൽ (Target Candidate - Correct Profile to Keep) *
                  </label>
                  <select 
                    className="form-select"
                    value={mergeTargetId}
                    onChange={(e) => setMergeTargetId(e.target.value)}
                  >
                    <option value="">മത്സരാർത്ഥിയെ തിരഞ്ഞെടുക്കുക</option>
                    {participants.filter(p => p.id !== mergeSourceId).map(p => (
                      <option key={p.id} value={p.id}>
                        {p.name} ({p.houseName}) - {p.parish} | Chest: {p.chestNumber || '-'} | Master: {p.masterId}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="modal-footer">
              <button className="btn btn-secondary" onClick={() => setShowMergeModal(false)}>അസാധുവാക്കുക (Cancel)</button>
              <button className="btn btn-primary" style={{ backgroundColor: 'var(--accent-color)', color: '#fff' }} onClick={handleExecuteMergeParticipants}>
                <GitMerge size={16} /> ലയിപ്പിക്കുക (Execute Merge)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEDICATED MODAL WINDOW FOR EXTERNAL DATABASE MERGE CONFLICT REPORT --- */}
      {mergeConflictModal.show && (
        <div className="modal-overlay" style={{ zIndex: 1002 }}>
          <div className="modal-content" style={{ maxWidth: '750px', width: '90vw', maxHeight: '85vh' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)' }}>
                <AlertTriangle size={22} />
                <span style={{ fontWeight: 'bold' }}>ഡാറ്റാബേസ് സംയോജന റിപ്പോർട്ടും നിയമ ലംഘനങ്ങളും (Merge Conflict Summary)</span>
              </div>
              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  onClick={() => setMergeConflictModal({ show: false, incomingDb: null, violations: [], validCount: 0, violatingCount: 0 })}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ overflowY: 'auto', padding: '1rem' }}>
              <div style={{ backgroundColor: 'rgba(239, 68, 68, 0.1)', borderLeft: '4px solid var(--accent-color)', padding: '0.85rem 1rem', borderRadius: '4px', marginBottom: '1rem' }}>
                <p style={{ margin: 0, fontWeight: 'bold', color: 'var(--accent-color)' }}>
                  ⚠️ {mergeConflictModal.violatingCount} മത്സരാർത്ഥികളുടെ വിവരങ്ങളിൽ മത്സര നിയമ ലംഘനങ്ങൾ കണ്ടെത്തി.
                </p>
                <p style={{ margin: '4px 0 0 0', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                  നിയമാനുസൃതമായ {mergeConflictModal.validCount} മത്സരാർത്ഥികളെ സുരക്ഷിതമായി ചേർക്കാനോ, അല്ലെങ്കിൽ തടസ്സമുള്ളവ പരിഹരിക്കാനോ താഴെപ്പറയുന്ന ഓപ്ഷനുകൾ തിരഞ്ഞെടുക്കുക.
                </p>
              </div>

              <h4 style={{ fontSize: '0.95rem', fontWeight: 'bold', marginBottom: '0.5rem', color: 'var(--primary-color)' }}>
                കണ്ടെത്തിയ നിയമ ലംഘനങ്ങൾ:
              </h4>

              <div style={{ maxHeight: '250px', overflowY: 'auto', border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.75rem', backgroundColor: 'var(--bg-secondary)' }}>
                {mergeConflictModal.violations.map((v, idx) => (
                  <div key={idx} style={{ marginBottom: '0.75rem', borderBottom: idx < mergeConflictModal.violations.length - 1 ? '1px dashed var(--border-color)' : 'none', paddingBottom: '0.5rem' }}>
                    <div style={{ fontWeight: 'bold', color: 'var(--text-color)' }}>
                      {idx + 1}. {v.participant.name} ({v.participant.parish})
                    </div>
                    {v.issues.map((issue, iIdx) => (
                      <div key={iIdx} style={{ fontSize: '0.85rem', color: 'var(--accent-color)', marginLeft: '1rem', marginTop: '4px' }}>
                        • <strong>{issue.title || 'നിയമ ലംഘനം'}</strong>: {issue.detail || issue}
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            </div>

            <div className="modal-footer" style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
              <button 
                type="button"
                className="btn btn-secondary"
                onClick={() => setMergeConflictModal({ show: false, incomingDb: null, violations: [], validCount: 0, violatingCount: 0 })}
              >
                റദ്ദാക്കുക (Cancel Merge)
              </button>
              <button 
                type="button"
                className="btn btn-primary"
                style={{ backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: '#fff' }}
                onClick={() => runMergeAuditAndProcess(mergeConflictModal.incomingDb, 'flag_violations')}
              >
                റിവ്യൂവിനായി ചേർക്കുക (Import & Flag ⚠️)
              </button>
              <button 
                type="button"
                className="btn btn-primary"
                onClick={() => runMergeAuditAndProcess(mergeConflictModal.incomingDb, 'skip_violations')}
              >
                നിയമാനുസൃതമായവ മാത്രം ചേർക്കുക (Skip Violations & Merge)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- DEDICATED POPUP MODAL FOR INDIVIDUAL PARTICIPANT CONFLICT DETAILS --- */}
      {conflictDetailsModal.show && (
        <div className="modal-overlay" style={{ zIndex: 1003 }}>
          <div className="modal-content" style={{ maxWidth: '650px', width: '92vw', maxHeight: '85vh' }}>
            <div className="modal-header" style={{ borderBottom: '1px solid var(--border-color)' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', color: 'var(--accent-color)' }}>
                <AlertTriangle size={22} />
                <span style={{ fontWeight: 'bold' }}>നിയമ ലംഘന വിവരങ്ങൾ (Rule Violation Details)</span>
              </div>
              <div className="titlebar-controls no-print">
                <button 
                  type="button" 
                  className="titlebar-btn close-btn" 
                  onClick={() => setConflictDetailsModal({ show: false, participantName: '', parish: '', issues: [] })}
                >
                  <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.2">
                    <path d="M1.5 1.5L10.5 10.5M10.5 1.5L1.5 10.5" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="modal-body" style={{ padding: '1.25rem', overflowY: 'auto' }}>
              <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.85rem 1rem', borderRadius: 'var(--radius-md)', marginBottom: '1rem', borderLeft: '4px solid var(--accent-color)' }}>
                <h4 style={{ margin: '0 0 0.25rem 0', color: 'var(--primary-color)', fontSize: '1.05rem' }}>
                  {conflictDetailsModal.participantName}
                </h4>
                <p style={{ margin: 0, fontSize: '0.88rem', color: 'var(--text-muted)' }}>
                  ഇടവക: <strong>{conflictDetailsModal.parish}</strong>
                </p>
              </div>

              <h4 style={{ fontSize: '0.92rem', fontWeight: 'bold', marginBottom: '0.65rem', color: 'var(--accent-color)' }}>
                കണ്ടെത്തിയ മത്സര നിയമ ലംഘനങ്ങൾ (Violation Breakdown):
              </h4>

              <div style={{ border: '1px solid var(--border-color)', borderRadius: 'var(--radius-md)', padding: '0.85rem', backgroundColor: 'var(--bg-secondary)' }}>
                {conflictDetailsModal.issues.map((issue, idx) => {
                  const titleStr = typeof issue === 'string' ? 'നിയമ ലംഘന വിവരങ്ങൾ' : (issue.title || 'നിയമ ലംഘനം');
                  const detailStr = typeof issue === 'string' ? issue : (issue.detail || '');
                  const partsList = typeof issue === 'object' && issue.otherParts ? issue.otherParts : [];

                  return (
                    <div key={idx} style={{ marginBottom: idx < conflictDetailsModal.issues.length - 1 ? '1.1rem' : '0', paddingBottom: idx < conflictDetailsModal.issues.length - 1 ? '0.85rem' : '0', borderBottom: idx < conflictDetailsModal.issues.length - 1 ? '1px dashed var(--border-color)' : 'none' }}>
                      <div style={{ fontWeight: 'bold', color: 'var(--accent-color)', fontSize: '0.92rem', marginBottom: '4px' }}>
                        ⚠️ {titleStr}
                      </div>
                      <div style={{ fontSize: '0.88rem', color: 'var(--text-color)', lineHeight: '1.45', marginBottom: partsList.length > 0 ? '0.5rem' : '0' }}>
                        {detailStr}
                      </div>

                      {partsList.length > 0 && (
                        <div style={{ backgroundColor: 'var(--bg-tertiary)', padding: '0.75rem 0.95rem', borderRadius: 'var(--radius-md)', border: '1px solid var(--border-color)', marginTop: '0.4rem' }}>
                          <div style={{ fontSize: '0.85rem', fontWeight: 'bold', color: 'var(--primary-color)', marginBottom: '6px' }}>
                            📋 ഈ ഇനത്തിൽ ഈ ഇടവകയിൽ നിന്നും രജിസ്റ്റർ ചെയ്തിട്ടുള്ള എല്ലാ മത്സരാർത്ഥികളുടെയും വിവരങ്ങൾ (ആകെ {partsList.length} പേർ):
                          </div>
                          <div style={{ display: 'flex', flexDirection: 'column', gap: '4px' }}>
                            {partsList.map((op, opIdx) => {
                              const opName = typeof op === 'string' ? op : op.name;
                              const opHouse = typeof op === 'object' ? op.houseName : '';
                              const opChest = typeof op === 'object' ? op.chestNumber : '';
                              return (
                                <div key={opIdx} style={{ fontSize: '0.85rem', color: 'var(--text-color)', display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                  <span style={{ fontWeight: 'bold', color: 'var(--primary-color)', minWidth: '22px' }}>{opIdx + 1}.</span>
                                  <strong>{opName}</strong>
                                  {opHouse && <span style={{ color: 'var(--text-muted)' }}>({opHouse})</span>}
                                  {opChest && <span style={{ backgroundColor: 'var(--bg-secondary)', padding: '1px 6px', borderRadius: '3px', fontSize: '0.78rem', fontWeight: 'bold', border: '1px solid var(--border-color)' }}>Chest #{opChest}</span>}
                                </div>
                              );
                            })}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="modal-footer">
              <button 
                type="button" 
                className="btn btn-primary" 
                onClick={() => setConflictDetailsModal({ show: false, participantName: '', parish: '', issues: [] })}
              >
                അടയ്ക്കുക (Close Window)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- CONFIRMATION MODAL FOR DATABASE RESET --- */}
      {confirmResetDbModal && (
        <div className="modal-overlay" style={{ zIndex: 9999 }}>
          <div className="modal-content" style={{ maxWidth: '480px', width: '90vw', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-color)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <AlertTriangle size={48} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--text-main)' }}>
              ഡാറ്റാബേസ് റീസെറ്റ് ചെയ്യണോ? (Reset Database)
            </h3>
            <p style={{ fontSize: '0.88rem', color: 'var(--text-muted)', marginBottom: '1.5rem', lineHeight: '1.5' }}>
              ഇത് നിങ്ങളുടെ എല്ലാ മത്സരാർത്ഥികളുടെയും ഫലങ്ങളുടെയും വിവരങ്ങൾ പൂർണ്ണമായി മായ്ച്ചുകളയും. ഈ നടപടി പിൻവലിക്കാൻ കഴിയില്ല!
            </p>
            <div style={{ display: 'flex', justifyContent: 'center', gap: '1rem' }}>
              <button 
                type="button"
                className="btn btn-secondary" 
                onClick={() => setConfirmResetDbModal(false)}
                style={{ padding: '8px 20px', fontWeight: 'bold' }}
              >
                റദ്ദാക്കുക (Cancel)
              </button>
              <button 
                type="button"
                className="btn btn-danger" 
                onClick={handleConfirmResetDatabase}
                style={{ padding: '8px 20px', fontWeight: 'bold' }}
              >
                അതെ, റീസെറ്റ് ചെയ്യുക (Yes, Reset)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* --- GENERAL WARNING POPUP MODAL WINDOW --- */}
      {warningModal.show && (
        <div className="modal-overlay" style={{ zIndex: 10000 }}>
          <div className="modal-content" style={{ maxWidth: '520px', width: '90vw', padding: '1.5rem', textAlign: 'center' }}>
            <div style={{ color: 'var(--accent-color)', marginBottom: '1rem', display: 'flex', justifyContent: 'center' }}>
              <AlertTriangle size={48} />
            </div>
            <h3 style={{ fontSize: '1.2rem', fontWeight: 'bold', marginBottom: '0.75rem', color: 'var(--accent-color)' }}>
              മത്സര രജിസ്ട്രേഷൻ താക്കീത്! (Warning)
            </h3>
            <p style={{ fontSize: '0.95rem', color: 'var(--text-main)', marginBottom: '1.5rem', lineHeight: '1.6', fontWeight: '500' }}>
              {warningModal.message}
            </p>
            <div style={{ display: 'flex', justifyContent: 'center' }}>
              <button 
                type="button"
                className="btn btn-primary" 
                onClick={() => setWarningModal({ show: false, message: "", items: [] })}
                style={{ padding: '8px 24px', fontWeight: 'bold', backgroundColor: 'var(--accent-color)', borderColor: 'var(--accent-color)', color: '#fff' }}
              >
                മനസ്സിലായി (OK, Close)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast.show && (
        <div style={{
          position: 'fixed',
          top: '20px',
          right: '20px',
          backgroundColor: toast.type === 'error' ? 'var(--accent-color)' : 'var(--primary-color)',
          color: '#ffffff',
          padding: '12px 24px',
          borderRadius: 'var(--radius-md)',
          boxShadow: 'var(--shadow-lg)',
          zIndex: 9999,
          fontWeight: '600',
          fontSize: '0.95rem'
        }}>
          {toast.message}
        </div>
      )}
    </div>
  );
}