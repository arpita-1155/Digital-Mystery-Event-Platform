// src/App.jsx
import { useState, useEffect, useRef } from 'react';
import { db } from './firebase';
import { doc, setDoc, getDoc, collection, getDocs, serverTimestamp } from 'firebase/firestore'; 
import './App.css';

// --- CONFIGURATION ---
const TOTAL_DURATION_MINUTES = 45; 
const MAX_WARNINGS = 5; 

// --- CREDENTIALS ---
const CREDENTIALS = [
  { id: 'TEAM-01', pass: '1001' }, { id: 'TEAM-02', pass: '2002' },
  { id: 'TEAM-03', pass: '3003' }, { id: 'TEAM-04', pass: '4004' },
  { id: 'TEAM-05', pass: '5005' }, { id: 'TEAM-06', pass: '6006' },
  { id: 'TEAM-07', pass: '7007' }, { id: 'TEAM-08', pass: '8008' },
  { id: 'TEAM-09', pass: '9009' }, { id: 'TEAM-10', pass: '1010' },
  { id: 'TEAM-11', pass: '1111' }, { id: 'TEAM-12', pass: '1212' },
  { id: 'TEAM-13', pass: '1313' }, { id: 'TEAM-14', pass: '1414' },
  { id: 'TEAM-15', pass: '1515' }, { id: 'TEAM-16', pass: '1616' },
  { id: 'TEAM-17', pass: '1717' }, { id: 'TEAM-18', pass: '1818' },
  { id: 'TEAM-19', pass: '1919' }, { id: 'TEAM-20', pass: '2020' },
  // *** ADMIN LOGIN ***
  { id: 'ADMIN', pass: 'admin123' }
];

// --- SECTION A: GENERAL SCREENING (Q01-Q20) ---
const sectionA_data = [
  { id: 'Q01', title: 'Q1. The Art Gallery Theft', content: 'A priceless painting was stolen during a 5-minute power outage. Detective Mehul observes:\n\nSuspect A (The Guard): Standing by the door with a flashlight.\nSuspect B (The Visitor): Standing in the center of the room, looking confused.\nSuspect C (The Janitor): Mopping a floor that is perfectly dry.\n\nObservation: Wet footprints lead from the empty frame to the ventilation shaft. Who is the thief?', options: ['Suspect A (The Guard)', 'Suspect B (The Visitor)', 'Suspect C (The Janitor)'], correct: 'Suspect C (The Janitor)' },
  { id: 'Q02', title: 'Q2. Medical Observation', content: 'Body recovered from a lake.\n- Foam in airway.\n- Water in lungs.\n- No water in stomach.\n\nWhat does this suggest?', options: ['Body dumped after death', 'True drowning', 'CPR attempt', 'Natural death'], correct: 'True drowning' },
  { id: 'Q03', title: 'Q3. Forensic Fact', content: 'Victim has a skull fracture. No swelling or hemorrhage is found around the fracture site. Conclusion?', options: ['Injury caused death', 'Fracture happened after death', 'High-impact trauma', 'Fall injury'], correct: 'Fracture happened after death' },
  { id: 'Q04', title: 'Q4. The High-Heat Heist', content: 'At 11 PM, a diamond is stolen.\nFacts:\n- Motion sensors are heat-sensitive.\n- Correct code was used; no alarm triggered.\n- AC was found turned off; room is unusually warm.\n- Sensors fail if room temperature reaches body temperature.\n\nWho knew the code?', options: ['Security Guard', 'Curator', 'Technician', 'Assistant'], correct: 'Technician' },
  { id: 'Q05', title: 'Q5. The Jewelry Shop Robbery', content: 'A shop is robbed. The window glass is broken. Police observe that the glass shards are located mostly OUTSIDE the shop. Who staged the theft?', options: ['Customer last seen leaving', 'Owner claiming burglary', 'Delivery boy', 'Watchman'], correct: 'Owner claiming burglary' },
  { id: 'Q06', title: 'Q6. The Locked Room Mystery', content: 'A necklace disappears from a locked bedroom. No forced entry. Fine talcum powder is found near the keyhole.\n\nSuspects:', options: ['Husband', 'Younger Brother', 'Mother-in-law', 'Daughter (dancer)'], correct: 'Daughter (dancer)' },
  { id: 'Q07', title: 'Q7. The Wedding Ring Theft', content: 'A ring is found inside a flour container in the kitchen. The kitchen was accessed frequently by only one person. Who is the criminal?', options: ['Bride’s Cousin', 'Groom’s Sister', 'Bride’s Father', 'Makeup Artist'], correct: 'Bride’s Cousin' },
  { id: 'Q08', title: 'Q8. The Factory Outage', content: 'Money disappears from a safe with no damage. A 3-minute power outage occurred at 1:05 AM, manually triggered from inside. Who is the criminal?', options: ['Factory Owner', 'Operations Manager', 'Chief Electrician', 'Owner’s Brother'], correct: 'Chief Electrician' },
  { id: 'Q09', title: 'Q9. The Author’s Study', content: 'A wealthy author with a severe peanut allergy is found dead in his locked study. A cup of coffee is on the table. The door has an automatic timer that locks it at 9:00 PM. Time of death: 8:15–8:45 PM. Who is the criminal?', options: ['Wife (Cooking 8–9 PM)', 'Son (Jogging, returned 8:50 PM)', 'Secretary (Left at 7:45 PM)'], correct: 'Secretary (Left at 7:45 PM)' },
  { id: 'Q10', title: 'Q10. The Silent Chamber', content: 'A judge is found dead in a sealed room. No poison or weapon. The air smells metallic. On the table: a glass of water, a candle burned halfway, and fresh flowers. What killed him?', options: ['Carbon Monoxide poisoning', 'Dehydration', 'Allergic reaction', 'Heart attack'], correct: 'Carbon Monoxide poisoning' },
  { id: 'Q11', title: 'Q11. The Rally Collapse', content: 'A politician collapses. Autopsy shows internal impact and water in the lungs, but no bullet fragments or poison. What was the murder weapon?', options: ['Plastic bullet', 'Air pressure blast', 'Frozen projectile (Ice bullet)', 'Micro explosive device'], correct: 'Frozen projectile (Ice bullet)' },
  { id: 'Q12', title: 'Q12. Procedure: The 7 S\'s', content: 'What is the correct order of the 7 S\'s of crime scene investigation?', options: ['Secure, Scan, Separate, See, Sketch, Search, Secure/Collect', 'Secure, Separate, Scan, See, Sketch, Search, Secure/Collect', 'Search, Secure, Separate, See, Sketch, Scan, Secure/Collect', 'Separate, Secure, Scan, See, Search, Sketch, Secure/Collect'], correct: 'Secure, Separate, Scan, See, Sketch, Search, Secure/Collect' },
  { id: 'Q13', title: 'Q13. The Monday Morning Office', content: 'A man is dead. The "Out of Office" sign is up, but the computer is on. The detective touches the monitor and arrests the secretary. Why?', options: ['The monitor was cold.', 'The screensaver was too bright.', 'The monitor was warm, proving recent use.', 'The computer was not plugged in.'], correct: 'The monitor was warm, proving recent use.' },
  { id: 'Q14', title: 'Q14. The Car Murder', content: 'A man was shot inside a locked car with windows up. No bullet holes were found in the car, only on the man\'s body. How was he murdered?', options: ['He got out of the car.', 'He was in a convertible with the top down.', 'He stepped out to help an animal.', 'He had his head out the window.'], correct: 'He was in a convertible with the top down.' },
  { id: 'Q15', title: 'Q15. Forensic Analysis: Blood Spatter', content: 'Elliptical (elongated) blood stains on a wall are observed with the "tails" or narrow ends pointing toward the floor. What does this indicate?', options: ['Shooter was above the victim', 'Victim was struck while pinned', 'Victim was struck and fell forward/downward', 'Direction undetermined'], correct: 'Victim was struck and fell forward/downward' },
  { id: 'Q16', title: 'Q16. The Tea Timing', content: 'Mr. Arora is dead at 8:00 PM. The wall clock stopped at 6:30 PM. The tea is still warm. It takes 45 minutes for tea to reach room temperature (24°C). Probable time of death?', options: ['6:00 PM', '6:30 PM', '7:15 PM', '7:30 PM'], correct: '7:30 PM' },
  { id: 'Q17', title: 'Q17. The Poisoned Ice', content: 'Four suspects drink from identical glasses. Only one dies. The poison was in the ice cubes. Who is guilty?', options: ['The one who drank slowly', 'The one who didn’t use ice', 'The host', 'The waiter'], correct: 'The one who drank slowly' },
  { id: 'Q18', title: 'Q18. The Downward Frame', content: 'In a room with no signs of struggle, one photo frame (containing a suspect\'s picture) is facing down while others are upright. Most logical reason?', options: ['Wind', 'Accident', 'Victim turned it before death', 'Killer dropped it'], correct: 'Victim turned it before death' },
  { id: 'Q19', title: 'Q19. The Wine Spiral', content: 'A victim leaves a proof in spilled wine forming a perfect clockwise spiral. What was the killer’s dominant hand?', options: ['Left', 'Right', 'Both are possible', 'None of the above'], correct: 'Right' },
  { id: 'Q20', title: 'Q20. High-Velocity Spatter', content: 'A businessman is found shot. Blood spatter is behind the chair; fine mist is on the bookshelf. No blood is on the victim’s hands. Gun is by the right hand. What happened?', options: ['Suicide', 'Shot from distance', 'Shot at close range', 'None'], correct: 'Shot at close range' }
];

// --- SECTION B: FORENSIC KNOWLEDGE (Q21-Q30) ---
const sectionB_data = [
  { id: 'Q21', title: 'Q21. Medical Terminology', content: 'Sudden collapse due to brain bleeding is medically termed as:', options: ['Myocardial Infarction', 'Cerebral Hemorrhage', 'Pulmonary Embolism', 'Epileptic Seizure'], correct: 'Cerebral Hemorrhage' },
  { id: 'Q22', title: 'Q22. Gas Poisoning', content: 'A dead body is found with bluish lips and cherry-red skin. Gas poisoning is suspected. Identify the gas:', options: ['Carbon Dioxide', 'Hydrogen Sulfide', 'Carbon Monoxide', 'Ammonia'], correct: 'Carbon Monoxide' },
  { id: 'Q23', title: 'Q23. Crime Scene Analysis', content: 'A person is found dead in a locked room. There is water on the floor and a hair dryer lying nearby. What is the most likely type of death?', options: ['Drowning', 'Accidental Electrocution', 'Poisoning', 'Blunt Force Trauma'], correct: 'Accidental Electrocution' },
  { id: 'Q24', title: 'Q24. Criminal Profiling', content: 'A killer who murders three or more people over a period of time with "cooling-off" intervals between kills is called:', options: ['Mass Murderer', 'Spree Killer', 'Serial Killer', 'Contract Killer'], correct: 'Serial Killer' },
  { id: 'Q25', title: 'Q25. Forensic Procedure', content: 'The medical examination of a dead body to determine the exact cause and manner of death is called:', options: ['Biopsy', 'Autopsy', 'Forensic Toxicology', 'Pathology Screening'], correct: 'Autopsy' },
  { id: 'Q26', title: 'Q26. Decomposition', content: 'A body is intentionally preserved to mislead investigators about the time of death, significantly slowing decomposition. This preservation process is called:', options: ['Mummification', 'Chemical Preservation', 'Adipocere Formation', 'Desiccation'], correct: 'Chemical Preservation' },
  { id: 'Q27', title: 'Q27. Toxicology', content: 'Which chemical binds with hemoglobin in the blood significantly more strongly than oxygen does?', options: ['Nitrogen', 'Carbon Monoxide', 'Methane', 'Chlorine'], correct: 'Carbon Monoxide' },
  { id: 'Q28', title: 'Q28. Legal Terminology', content: 'A person who is present at the crime scene but is not involved in committing the crime is legally termed a:', options: ['Accomplice', 'Suspect', 'Bystander', 'Perpetrator'], correct: 'Bystander' },
  { id: 'Q29', title: 'Q29. Investigation Process', content: 'The official report prepared by the police and submitted to the court after completing a criminal investigation is the:', options: ['Charge Sheet', 'First Information Report (FIR)', 'Postmortem Certificate', 'Witness Statement'], correct: 'Charge Sheet' },
  { id: 'Q30', title: 'Q30. Environmental Factors', content: 'A body discovered in a consistently cold environment (such as a freezer or snow) will show significantly delayed:', options: ['Rigor Mortis', 'Decomposition', 'Livor Mortis', 'Algor Mortis'], correct: 'Decomposition' }
];

// --- SECTION C: VISUAL PUZZLES (Q31-Q34) ---
const sectionC_data = [
  {
    id: 'Q31',
    title: 'Q31. Who is the Killer?',
    image: '/public/Picture1.png', // Ensure 'Picture 1.png' is in your 'public' folder
    summary: `SCENE ANALYSIS:
The image shows a victim on the floor near a half-eaten cake.
- Wall Clock: 6:15 PM
- Kitchen Sign: "Dinner Shift Starts at 8:00 PM"
- Suspects: Nervous Cousin, Waiter, Business Rival.

Who is the killer?`,
    questions: [
      { 
        qid: 'Q31', 
        type: 'mcq', 
        text: 'Identify the Killer:', 
        options: ['Nervous Cousin', 'Waiter', 'Business Rival'],
        correct: 'Waiter' 
      }
    ]
  },
  {
    id: 'Q32',
    title: 'Q32. Decode the Killer’s Name',
    image: '/Picture 2.png', // Ensure 'Picture 2.png' is in your 'public' folder
    summary: `CIPHER CHALLENGE:
The victim left a code: 73 63 22 32 73 81.
Use the standard T9 Keypad logic (e.g., 2 = ABC).
- First digit = Key
- Second digit = Letter Position

Decode the name.`,
    questions: [
      { 
        qid: 'Q32', 
        type: 'mcq', 
        text: 'What is the killer’s name?', 
        options: ['PETER', 'DRAKE', 'ROBERT', 'PATRICK'],
        correct: 'ROBERT' 
      }
    ]
  },
  {
    id: 'Q33',
    title: 'Q33. Who Killed Emely?',
    image: '/Picture 3.png', // Ensure 'Picture 3.png' is in your 'public' folder
    summary: `LAUNDROMAT MYSTERY:
Emely was found dead.
- Suspect: Katie claims she arrived at 7:30 PM.
- Clue: Look closely at the washing machine behind Katie and her jewelry.

Who is the killer?`,
    questions: [
      { 
        qid: 'Q33', 
        type: 'mcq', 
        text: 'Select the Killer:', 
        options: ['Katie', 'Lexi', 'Mrs. June'],
        correct: 'Katie' 
      }
    ]
  },
  {
    id: 'Q34',
    title: 'Q34. Dollhouse Crime Scene',
    image: '/Picture 4.png', // Ensure 'Picture 4.png' is in your 'public' folder
    summary: `MINIATURE CRIME:
A detective examines a dollhouse crime scene where a body is found in the sink.
Observation: Legs are sticking straight up.

What does this indicate?`,
    questions: [
      { 
        qid: 'Q34', 
        type: 'mcq', 
        text: 'Conclusion:', 
        options: ['Accidental Slip', 'Staged / Impossible Fall', 'Heart Attack', 'Drowning'],
        correct: 'Staged / Impossible Fall' 
      }
    ]
  }
];

function App() {
  const [step, setStep] = useState('login'); 
  const [teamId, setTeamId] = useState('');
  const [password, setPassword] = useState('');
  const [answers, setAnswers] = useState({});
  const [currentSection, setCurrentSection] = useState(null); 
  const [currentIndex, setCurrentIndex] = useState(0); 
  const [timeLeft, setTimeLeft] = useState(TOTAL_DURATION_MINUTES * 60); 
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  const [adminData, setAdminData] = useState([]);
  const [warningModal, setWarningModal] = useState(null); 

  const hasSubmitted = useRef(false);
  const warningsRef = useRef(0);
  const lastStrikeTime = useRef(0);
  const globalEndTimeRef = useRef(null);

  const isFullScreenSupported = () => {
    return document.fullscreenEnabled || 
           document.webkitFullscreenEnabled || 
           document.mozFullScreenEnabled ||
           document.msFullscreenEnabled;
  };

  // --- RESTORE SESSION ---
  useEffect(() => {
    const storedTeam = localStorage.getItem('quizTeamId');
    const storedGlobalEnd = localStorage.getItem('quizGlobalEndTime');
    const storedStatus = localStorage.getItem('quizSubmitted');

    if (storedTeam && storedGlobalEnd) {
      if (storedTeam === 'ADMIN') {
        setTeamId('ADMIN');
        setStep('admin');
        return;
      }

      if (storedStatus === 'true') {
        setStep('submitted');
        return;
      }
      setTeamId(storedTeam);
      globalEndTimeRef.current = parseInt(storedGlobalEnd);
      
      const savedAns = localStorage.getItem('quizAnswers');
      if (savedAns) setAnswers(JSON.parse(savedAns));

      const remaining = Math.floor((globalEndTimeRef.current - Date.now()) / 1000);
      if (remaining > 0) {
        setTimeLeft(remaining);
        setStep('dashboard');
      } else {
        setStep('dashboard'); 
        setTimeLeft(0);
      }
    }
  }, []);

  // --- GLOBAL TIMER ---
  useEffect(() => {
    if (step === 'login' || step === 'submitted' || step === 'admin') return;
    const timer = setInterval(() => {
      if (globalEndTimeRef.current) {
        const remaining = Math.floor((globalEndTimeRef.current - Date.now()) / 1000);
        setTimeLeft(remaining);
        if (remaining <= 0) {
          clearInterval(timer);
          if (!hasSubmitted.current) {
             handleFinalSubmit(true);
          }
        }
      }
    }, 1000);
    return () => clearInterval(timer);
  }, [step]);

  // --- SECURITY ---
  useEffect(() => {
    if (step === 'login' || step === 'submitted' || step === 'admin') return;

    const securityInterval = setInterval(() => {
      const hasLostFocus = !document.hasFocus(); 
      const noFullScreen = isFullScreenSupported() && !document.fullscreenElement;

      if (hasLostFocus || noFullScreen) {
        if (warningModal) return; 

        const now = Date.now();
        if (now - lastStrikeTime.current < 1000) return;
        lastStrikeTime.current = now;

        warningsRef.current += 1;
        let reason = hasLostFocus ? "Tab Switched / Clicked Outside" : "Exited Full Screen";

        if (warningsRef.current >= MAX_WARNINGS) {
           clearInterval(securityInterval);
           setWarningModal({ fatal: true, message: `VIOLATION LIMIT REACHED (${warningsRef.current}/${MAX_WARNINGS}). SUBMITTING EXAM.` });
           setTimeout(() => handleFinalSubmit(true), 2000);
        } else {
           setWarningModal({ 
             fatal: false, 
             message: `⚠️ WARNING ${warningsRef.current}/${MAX_WARNINGS}: ${reason}` 
           });
        }
      }
    }, 1000);

    return () => clearInterval(securityInterval);
  }, [step, warningModal]);

  // --- ACTIONS ---
  
  const handleLogin = async (e) => {
    e.preventDefault();
    setLoading(true);

    const validUser = CREDENTIALS.find(c => c.id === teamId.toUpperCase());
    if (validUser && validUser.pass === password) {
      
      // ADMIN CHECK
      if (validUser.id === 'ADMIN') {
        localStorage.setItem('quizTeamId', 'ADMIN');
        localStorage.setItem('quizGlobalEndTime', Date.now() + 99999999);
        setStep('admin');
        fetchAdminData();
        setLoading(false);
        return;
      }

      // STUDENT DB CHECK
      try {
        const docRef = doc(db, "submissions", teamId.toUpperCase());
        const docSnap = await getDoc(docRef);
        if (docSnap.exists() && docSnap.data().status) {
          setErrorMsg('ACCESS DENIED: Exam already submitted.');
          setLoading(false);
          return;
        }
      } catch (err) {
        console.error("DB Check Failed", err);
      }

      localStorage.clear(); 
      hasSubmitted.current = false;
      warningsRef.current = 0;
      lastStrikeTime.current = 0;

      const end = Date.now() + (TOTAL_DURATION_MINUTES * 60 * 1000);
      localStorage.setItem('quizTeamId', teamId.toUpperCase());
      localStorage.setItem('quizGlobalEndTime', end);
      globalEndTimeRef.current = end;
      
      setStep('dashboard');
      if (isFullScreenSupported()) {
        try { document.documentElement.requestFullscreen().catch(()=>{}); } catch (e) {}
      }
    } else {
      setErrorMsg('INVALID ID OR PASSWORD');
    }
    setLoading(false);
  };

  const resumeExam = () => {
    if (isFullScreenSupported()) {
      try {
        document.documentElement.requestFullscreen().then(() => {
          setWarningModal(null); 
        }).catch(() => {
          setWarningModal(null); 
        });
      } catch(e) {
        setWarningModal(null);
      }
    } else {
      setWarningModal(null);
    }
  };

  const openSection = (sec) => {
    setCurrentSection(sec);
    if (sec === 'A') setStep('quizA');
    else if (sec === 'B') setStep('quizB');
    else if (sec === 'C') setStep('quizC');
    setCurrentIndex(0);
    if (isFullScreenSupported()) {
        try { document.documentElement.requestFullscreen().catch(()=>{}); } catch (e) {}
    }
  };

  const returnToDashboard = () => {
    setStep('dashboard');
    setCurrentSection(null);
  };

  const handleInput = (id, value) => {
    const newAns = { ...answers, [id]: value };
    setAnswers(newAns);
    localStorage.setItem('quizAnswers', JSON.stringify(newAns));
  };

  const getFormattedTimeTaken = () => {
    const totalSeconds = TOTAL_DURATION_MINUTES * 60;
    const takenSeconds = totalSeconds - Math.max(0, timeLeft);
    const m = Math.floor(takenSeconds / 60);
    const s = takenSeconds % 60;
    return `${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleFinalSubmit = async (auto = false) => {
    if (hasSubmitted.current) return;
    if (!auto) {
      if (!window.confirm("Are you sure you want to finish the exam?")) return;
    }
    hasSubmitted.current = true;
    setLoading(true);
    
    let score = 0;
    
    // SCORING:
    // A: +1 Correct, -0.5 Incorrect
    sectionA_data.forEach(q => { 
        if(answers[q.id]) {
            if(answers[q.id] === q.correct) score += 1;
            else score -= 0.5;
        }
    });

    // B: +1 Correct, No negative
    sectionB_data.forEach(q => {
        if(answers[q.id] === q.correct) score += 1;
    });

    // C: +2 Correct, No negative
    sectionC_data.forEach(q => { 
      q.questions.forEach(subQ => {
        if(subQ.type === 'mcq' && answers[subQ.qid] === subQ.correct) score += 2; 
      });
    });

    try {
      await setDoc(doc(db, "submissions", teamId.toUpperCase()), {
        team: teamId.toUpperCase(),
        answers: answers,
        score_Auto: score,
        timeTaken: getFormattedTimeTaken(),
        warnings: warningsRef.current,
        submittedAt: serverTimestamp(),
        status: auto ? 'Disqualified/Timeout' : 'Completed'
      });
      localStorage.setItem('quizSubmitted', 'true');
      localStorage.removeItem('quizGlobalEndTime');
      localStorage.removeItem('quizAnswers');
      setStep('submitted');
      setWarningModal(null); 
      if(document.fullscreenElement) document.exitFullscreen().catch(()=>{});
    } catch (err) {
      console.error(err);
      alert("Submission Error. Check internet.");
      hasSubmitted.current = false;
    }
    setLoading(false);
  };

  // --- ADMIN FUNCTIONS ---
  const fetchAdminData = async () => {
    const querySnapshot = await getDocs(collection(db, "submissions"));
    const data = [];
    querySnapshot.forEach((doc) => {
      data.push(doc.data());
    });
    setAdminData(data);
  };

  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    // Header (Supports up to Q34)
    csvContent += "Team ID,Score (Auto),Time Taken,Warnings,Status";
    for(let i=1; i<=34; i++) {
        csvContent += `,Q${i}`;
    }
    csvContent += "\n";

    adminData.forEach((row) => {
      let rowString = `${row.team},${row.score_Auto},${row.timeTaken},${row.warnings},${row.status}`;
      for(let i=1; i<=34; i++) {
        let qKey = i < 10 ? `Q0${i}` : `Q${i}`;
        let ans = row.answers ? row.answers[qKey] || "" : "";
        ans = ans.toString().replace(/,/g, ";").replace(/\n/g, " "); 
        rowString += `,${ans}`;
      }
      csvContent += rowString + "\n";
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "exam_results.csv");
    document.body.appendChild(link);
    link.click();
  };

  const formatTimeDisplay = (s) => {
    if (s < 0) return "0:00";
    return `${Math.floor(s/60)}:${(s%60).toString().padStart(2,'0')}`;
  };

  // --- VIEWS ---
  
  if (step === 'login') return (
    <div className="login-container evidence-card">
      <div className="stamp">TOP SECRET</div>
      <h1 className="main-title">Detective Academy</h1>
      <p style={{marginBottom:'20px', color:'#aaa'}}>Total Time: {TOTAL_DURATION_MINUTES} Mins</p>
      <form onSubmit={handleLogin}>
        <input placeholder="UNIT ID (e.g. TEAM-01)" value={teamId} onChange={e => setTeamId(e.target.value)} />
        <input type="password" placeholder="PASSCODE" value={password} onChange={e => setPassword(e.target.value)} />
        {errorMsg && <p style={{color:'red'}}>{errorMsg}</p>}
        <button className="submit-btn" disabled={loading}>{loading ? 'VERIFYING...' : 'ACCESS PORTAL'}</button>
      </form>
    </div>
  );

  // ADMIN
  if (step === 'admin') return (
    <div className="case-file-container" style={{maxWidth:'900px'}}>
      <div className="case-header">
        <h2 style={{margin:0, color:'#00adb5'}}>ADMIN DASHBOARD</h2>
        <button onClick={() => { localStorage.clear(); window.location.reload(); }} style={{background:'#333', border:'none', color:'white', cursor:'pointer'}}>LOGOUT</button>
      </div>
      
      <div style={{display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:'20px'}}>
        <h3 style={{margin:0}}>Live Results ({adminData.length})</h3>
        <button onClick={fetchAdminData} style={{marginRight:'10px', padding:'10px', background:'#444', color:'white', border:'none', cursor:'pointer'}}>REFRESH</button>
        <button onClick={exportToCSV} className="submit-btn" style={{width:'auto', background:'#00adb5'}}>DOWNLOAD EXCEL (CSV)</button>
      </div>

      <div style={{overflowX:'auto'}}>
        <table style={{width:'100%', borderCollapse:'collapse', fontSize:'0.9rem'}}>
          <thead>
            <tr style={{background:'#333', textAlign:'left'}}>
              <th style={{padding:'10px'}}>Team</th>
              <th style={{padding:'10px'}}>Score</th>
              <th style={{padding:'10px'}}>Time</th>
              <th style={{padding:'10px'}}>Warnings</th>
              <th style={{padding:'10px'}}>Status</th>
            </tr>
          </thead>
          <tbody>
            {adminData.map((row) => (
              <tr key={row.team} style={{borderBottom:'1px solid #444'}}>
                <td style={{padding:'10px', fontWeight:'bold', color:'#00adb5'}}>{row.team}</td>
                <td style={{padding:'10px'}}>{row.score_Auto}</td>
                <td style={{padding:'10px'}}>{row.timeTaken}</td>
                <td style={{padding:'10px', color: row.warnings > 2 ? 'red' : 'white'}}>{row.warnings}</td>
                <td style={{padding:'10px'}}>{row.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  if (step === 'submitted') return (
    <div className="case-file-container" style={{textAlign:'center', marginTop:'100px'}}>
      <div className="stamp" style={{borderColor: '#00adb5', color: '#00adb5'}}>EVIDENCE LOGGED</div>
      <h1>Exam Completed</h1>
      <p>Data transmitted successfully.</p>
      <p style={{color:'#00adb5', marginTop:'20px'}}>Time Taken: {getFormattedTimeTaken()}</p>
    </div>
  );

  const Header = () => (
    <div className="case-header">
      <div style={{display:'flex', gap:'10px', alignItems:'center'}}>
        {step !== 'dashboard' && (
           <button onClick={returnToDashboard} style={{background:'#333', border:'1px solid #555', color:'#fff', padding:'5px 10px', cursor:'pointer'}}>
             ☰ MENU
           </button>
        )}
        <div>
          <h2 style={{margin:0, color:'#8a0b0b'}}>{step === 'dashboard' ? 'DASHBOARD' : `SECTION ${currentSection}`}</h2>
          <span style={{fontSize:'0.9rem', color:'#666'}}>UNIT: <span style={{color:'#fff'}}>{teamId}</span></span>
        </div>
      </div>
      <div style={{textAlign:'right'}}>
         <div style={{fontSize:'1.5rem', fontFamily:'monospace', color: timeLeft < 300 ? 'red' : '#00adb5'}}>
            {formatTimeDisplay(timeLeft)}
         </div>
         <div style={{fontSize:'0.8rem', color: warningsRef.current > 0 ? 'red':'#444'}}>STRIKES: {warningsRef.current}</div>
      </div>
    </div>
  );

  return (
    <>
      {warningModal && (
        <div style={{
          position:'fixed', top:0, left:0, width:'100%', height:'100%', 
          backgroundColor:'rgba(20,0,0,0.95)', zIndex:9999,
          display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center',
          color: 'red', textAlign:'center', padding:'20px'
        }}>
          <h1 style={{fontSize:'3rem', marginBottom:'20px'}}>⚠️ SECURITY ALERT</h1>
          <p style={{fontSize:'1.5rem', marginBottom:'40px', color:'white'}}>{warningModal.message}</p>
          
          {!warningModal.fatal && (
            <button 
              onClick={resumeExam}
              style={{
                padding:'20px 40px', fontSize:'1.5rem', background:'red', color:'white', 
                border:'2px solid white', cursor:'pointer', fontWeight:'bold'
              }}
            >
              {isFullScreenSupported() ? 'RESUME (RETURN TO FULL SCREEN)' : 'RESUME EXAM'}
            </button>
          )}
          
          {warningModal.fatal && <p style={{color:'white'}}>Submitting answers...</p>}
        </div>
      )}

      {step === 'dashboard' && (
        <div className="case-file-container">
          <Header />
          <div className="evidence-card" style={{borderLeft:'4px solid #00adb5'}}>
            <h3>📂 SECTION A: General Screening</h3>
            <p>20 MCQs | Forensic & Logic (+1, -0.5)</p>
            <button className="submit-btn" style={{background:'#222', border:'1px solid #444'}} onClick={() => openSection('A')}>OPEN SECTION A</button>
          </div>
          <div className="evidence-card" style={{borderLeft:'4px solid #00adb5'}}>
            <h3>📂 SECTION B: Forensic Knowledge</h3>
            <p>10 MCQs | Medical & Law (+1)</p>
            <button className="submit-btn" style={{background:'#222', border:'1px solid #444'}} onClick={() => openSection('B')}>OPEN SECTION B</button>
          </div>
          <div className="evidence-card" style={{borderLeft:'4px solid #00adb5'}}>
            <h3>📂 SECTION C: Visual Puzzles</h3>
            <p>4 Visual Mysteries (+2)</p>
            <button className="submit-btn" style={{background:'#222', border:'1px solid #444'}} onClick={() => openSection('C')}>OPEN SECTION C</button>
          </div>
          <div style={{marginTop:'40px', borderTop:'1px solid #333', paddingTop:'20px'}}>
            <button className="submit-btn" onClick={() => handleFinalSubmit(false)} disabled={loading} style={{background: '#8a0b0b'}}>
              {loading ? 'UPLOADING...' : 'FINISH & SUBMIT EXAM'}
            </button>
          </div>
        </div>
      )}

      {/* QUIZ RENDERER */}
      {(step.startsWith('quiz')) && (() => {
        let data, isSimpleLayout;
        if (step === 'quizA') { data = sectionA_data; isSimpleLayout = true; }
        else if (step === 'quizB') { data = sectionB_data; isSimpleLayout = true; }
        else if (step === 'quizC') { data = sectionC_data; isSimpleLayout = false; }

        const currentItem = data[currentIndex];
        const isLast = currentIndex === data.length - 1;

        return (
          <div className="case-file-container">
            <Header />
            <div className="evidence-card" style={{minHeight:'400px'}}>
              
              {/* SIMPLE LAYOUT (A & B) */}
              {isSimpleLayout && (
                <>
                  <div style={{display:'flex', justifyContent:'space-between', marginBottom:'10px'}}>
                    <h4>{currentItem.title}</h4>
                    <span>{currentIndex + 1} / {data.length}</span>
                  </div>
                  <p style={{whiteSpace:'pre-line', fontSize:'1.1rem'}}>{currentItem.content}</p>
                  <div style={{display:'flex', flexDirection:'column', gap:'10px', marginTop:'20px'}}>
                    {currentItem.options.map(opt => (
                      <label key={opt} className={`radio-label ${answers[currentItem.id]===opt ? 'selected':''}`}>
                        <input type="radio" checked={answers[currentItem.id]===opt} onChange={()=>handleInput(currentItem.id, opt)} /> {opt}
                      </label>
                    ))}
                  </div>
                </>
              )}

              {/* COMPLEX LAYOUT (C) */}
              {!isSimpleLayout && (
                <>
                  <h3 style={{color:'#00adb5', borderBottom:'1px solid #333', paddingBottom:'10px'}}>{currentItem.title}</h3>
                  {currentItem.image && (
                    <img src={currentItem.image} alt="Evidence" style={{width:'100%', borderRadius:'5px', marginBottom:'15px', border:'1px solid #444'}} />
                  )}
                  <div style={{background:'#111', padding:'15px', borderRadius:'5px', marginBottom:'20px', fontSize:'0.9rem', color:'#ccc', whiteSpace:'pre-line', borderLeft:'2px solid #555'}}>
                    {currentItem.summary}
                  </div>
                  {currentItem.questions.map((q) => (
                    <div key={q.qid} style={{marginBottom:'20px'}}>
                      <p style={{fontWeight:'bold', color:'#fff', marginBottom:'5px'}}>{q.text}</p>
                      {q.type === 'mcq' ? (
                        <div style={{display:'flex', flexDirection:'column', gap:'5px'}}>
                          {q.options.map(opt => (
                            <label key={opt} className={`radio-label ${answers[q.qid]===opt ? 'selected':''}`} style={{padding:'5px 10px'}}>
                              <input type="radio" checked={answers[q.qid]===opt} onChange={()=>handleInput(q.qid, opt)} /> {opt}
                            </label>
                          ))}
                        </div>
                      ) : (
                        <input type="text" placeholder="Type answer..." value={answers[q.qid] || ''} onChange={(e) => handleInput(q.qid, e.target.value)}
                          style={{background:'#111', border:'1px solid #444', color:'#00adb5'}} />
                      )}
                    </div>
                  ))}
                </>
              )}
            </div>

            <div style={{display:'flex', justifyContent:'space-between', gap:'20px'}}>
              <button onClick={() => setCurrentIndex(p => Math.max(0, p-1))} disabled={currentIndex===0} className="submit-btn" style={{background:'#333'}}>PREVIOUS</button>
              {isLast ? (
                <button onClick={returnToDashboard} className="submit-btn" style={{background:'#444'}}>BACK TO DASHBOARD</button>
              ) : (
                <button onClick={() => setCurrentIndex(p => Math.min(data.length-1, p+1))} className="submit-btn" style={{background:'#00adb5'}}>NEXT</button>
              )}
            </div>
          </div>
        );
      })()}
    </>
  );
}

export default App;