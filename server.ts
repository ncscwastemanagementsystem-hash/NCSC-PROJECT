import express from 'express';
import http from 'http';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'url';
import multer from 'multer';
import crypto from 'crypto';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const PORT = process.env.PORT ? parseInt(process.env.PORT, 10) : 3000;

// Body parser
app.use(express.json({ limit: '100mb' }));
app.use(express.urlencoded({ extended: true, limit: '100mb' }));

// Directories
const DATA_DIR = path.join(__dirname, 'data');
const UPLOADS_DIR = path.join(DATA_DIR, 'uploads');
const DB_FILE = path.join(DATA_DIR, 'vault-db.json');

if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}
if (!fs.existsSync(UPLOADS_DIR)) {
  fs.mkdirSync(UPLOADS_DIR, { recursive: true });
}

// Multer storage
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => {
    cb(null, UPLOADS_DIR);
  },
  filename: (_req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
    const ext = path.extname(file.originalname);
    const base = path.basename(file.originalname, ext).replace(/[^a-zA-Z0-9_-]/g, '_');
    cb(null, `${base}-${uniqueSuffix}${ext}`);
  },
});
const upload = multer({
  storage,
  limits: { fileSize: 100 * 1024 * 1024 }, // 100MB limit
});

// Helper for default folders per project
function getDefaultFolders(projectId: string) {
  return [
    {
      id: `folder-ppt-${projectId}`,
      projectId,
      name: 'PPT & Presentations',
      color: '#f59e0b', // Amber
      icon: 'ppt',
      isDefault: true,
      description: 'Science congress presentation decks, slide outlines, judge defense decks (PPTX, PPT, PDF)',
      createdAt: '2026-10-10T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: `folder-images-${projectId}`,
      projectId,
      name: 'Images & Photos',
      color: '#ec4899', // Pink / Rose
      icon: 'image',
      isDefault: true,
      description: 'Project hardware photographs, vector schematics, poster graphics, JPEG, PNG, SVG',
      createdAt: '2026-10-10T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: `folder-3d-${projectId}`,
      projectId,
      name: '3D Models & Simulations',
      color: '#06b6d4', // Cyan
      icon: '3d',
      isDefault: true,
      description: 'Interactive 3D Three.js exhibition simulations, CAD files, STL and OBJ meshes',
      createdAt: '2026-10-10T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: `folder-code-${projectId}`,
      projectId,
      name: 'Source Code & Firmware',
      color: '#10b981', // Emerald
      icon: 'code',
      isDefault: true,
      description: 'ESP32 microcontroller firmware (.ino), Python MobileNetV3 AI classifier, and C++ code',
      createdAt: '2026-10-10T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: `folder-docs-${projectId}`,
      projectId,
      name: 'Research Papers & Reports',
      color: '#3b82f6', // Blue
      icon: 'doc',
      isDefault: true,
      description: 'NCSC full research report, scientific methodology, hypothesis, and technical whitepapers',
      createdAt: '2026-10-10T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
    {
      id: `folder-data-${projectId}`,
      projectId,
      name: 'Datasets & Test Results',
      color: '#8b5cf6', // Violet
      icon: 'data',
      isDefault: true,
      description: 'Empirical testing trials (50 runs), sensor calibration readings, CSV and spreadsheets',
      createdAt: '2026-10-10T10:00:00.000Z',
      updatedAt: '2026-10-15T10:00:00.000Z',
    },
  ];
}

// Auto-determine folder based on file extension and category
function getFolderForFile(filename: string, category: string, projectId: string, customFolders: any[] = []) {
  const ext = path.extname(filename).toLowerCase();

  if (['.ppt', '.pptx', '.key', '.odp'].includes(ext) || category === 'Presentations & Posters') {
    return `folder-ppt-${projectId}`;
  }
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp'].includes(ext) || category === 'Photos & Media' || category === 'Hardware & Circuit Schematics') {
    return `folder-images-${projectId}`;
  }
  if (['.html', '.htm', '.stl', '.obj', '.gltf', '.glb', '.3ds'].includes(ext) || category === '3D Simulations & CAD') {
    return `folder-3d-${projectId}`;
  }
  if (['.ino', '.py', '.cpp', '.c', '.h', '.js', '.ts', '.json', '.css'].includes(ext) || category === 'Source Code & Firmware') {
    return `folder-code-${projectId}`;
  }
  if (['.csv', '.xlsx', '.xls', '.dat', '.tsv'].includes(ext) || category === 'Datasets & Test Results') {
    return `folder-data-${projectId}`;
  }
  if (['.pdf', '.docx', '.doc', '.md', '.txt', '.rtf'].includes(ext) || category === 'Research Papers & Reports') {
    return `folder-docs-${projectId}`;
  }

  // Fallback to docs
  return `folder-docs-${projectId}`;
}

// Read database and auto-migrate folders & files
function readDB() {
  try {
    let db: any = {};
    if (fs.existsSync(DB_FILE)) {
      const data = fs.readFileSync(DB_FILE, 'utf8');
      db = JSON.parse(data);
    }

    // Ensure admins array exists for multiple administrator support
    if (!db.admins || db.admins.length === 0) {
      db.admins = [
        {
          id: 'admin-primary',
          username: db.admin?.username || 'admin',
          email: db.admin?.email || 'ncscwastemanagementsystem@gmail.com',
          passwordHash: db.admin?.passwordHash || crypto.createHash('sha256').update('ncsc2026!vault').digest('hex'),
          displayName: db.admin?.displayName || 'NCSC Science Project Leader',
          role: 'Super Administrator',
          institution: 'National Children\'s Science Congress (NCSC)',
          securityQuestion: db.admin?.securityQuestion || 'What is the primary scientific hypothesis of your project?',
          securityAnswerHash: db.admin?.securityAnswerHash || crypto.createHash('sha256').update('source segregation increases recovery').digest('hex'),
          createdAt: '2026-08-01T00:00:00.000Z',
          lastLogin: new Date().toISOString(),
          theme: 'dark',
          twoFactorEnabled: false,
        },
        {
          id: 'admin-mentor',
          username: 'mentor',
          email: 'mentor.ncsc@gmail.com',
          passwordHash: crypto.createHash('sha256').update('mentor2026!vault').digest('hex'),
          displayName: 'Dr. S. K. Raman (Mentor & Co-Admin)',
          role: 'Science Mentor & Co-Admin',
          institution: 'NCSC Science Advisory Council',
          securityQuestion: 'What is your primary mentorship specialty?',
          securityAnswerHash: crypto.createHash('sha256').update('environmental science').digest('hex'),
          createdAt: '2026-08-15T00:00:00.000Z',
          lastLogin: new Date().toISOString(),
          theme: 'dark',
          twoFactorEnabled: false,
        }
      ];
    }
    if (!db.admin) {
      db.admin = db.admins[0];
    }

    if (!db.projects || db.projects.length === 0) {
      db.projects = [
        {
          id: 'proj-smart-waste-ncsc',
          name: 'Smart Waste-to-Resource System',
          shortTitle: 'Smart Waste-to-Resource',
          code: 'NCSC-2026-ENV-01',
          tagline: 'AI-Powered Intelligent Waste Segregation & Dual Recovery (Biogas, Compost & Controlled Pyrolysis)',
          description: 'An integrated multi-sensor smart waste segregation bin and downstream resource recovery model. Uses optical camera vision + soil moisture sensor + inductive metal detector + load cell with an ESP32 controller and servo-diverter flap to classify waste into Wet, Plastic, Other, and Unknown/Reject streams, connecting directly to biological (composting, anaerobic digestion) and conceptual thermochemical (controlled pyrolysis) recovery units.',
          category: 'Waste Management & Resource Recovery',
          subTheme: 'Fostering Health, Nutrition & Well-Being through Clean Technology',
          leadResearcher: 'Team NCSC (Lead Scientist)',
          guideTeacher: 'Dr. S. K. Raman (Senior Science Mentor)',
          status: 'National Finalist',
          progress: 95,
          targetExhibitionDate: '2026-11-20',
          tags: ['AI Classification', 'ESP32', 'Three.js 3D Simulation', 'Anaerobic Digestion', 'Pyrolysis Concept', 'Circular Economy'],
          createdAt: '2026-08-15T09:00:00.000Z',
          updatedAt: new Date().toISOString(),
        },
        {
          id: 'proj-solar-desal-ncsc',
          name: 'Solar-Assisted Membrane Water Purification & Desalination Unit',
          shortTitle: 'Solar Desalination Unit',
          code: 'NCSC-2026-WTR-02',
          tagline: 'Multi-stage solar-thermal evaporation with graphene-oxide membrane filtration for coastal communities',
          description: 'Future research project prototype investigating parabolic solar concentrators with porous carbon-nanotube photothermal absorbers and condensation arrays for low-cost off-grid drinking water production from seawater.',
          category: 'Clean Water & Renewable Energy',
          subTheme: 'Science for Sustainable Living',
          leadResearcher: 'Team NCSC (Lead Scientist)',
          guideTeacher: 'Prof. M. Anita',
          status: 'In Progress',
          progress: 40,
          targetExhibitionDate: '2027-02-15',
          tags: ['Solar Thermal', 'Desalination', 'Photothermal', 'Clean Water'],
          createdAt: '2026-09-01T10:30:00.000Z',
          updatedAt: new Date().toISOString(),
        }
      ];
    }

    // Ensure folders array exists
    if (!db.folders) {
      db.folders = [];
    }

    // Ensure each project has its default folders
    db.projects.forEach((proj: any) => {
      const defaults = getDefaultFolders(proj.id);
      defaults.forEach((defFolder) => {
        const exists = db.folders.some((f: any) => f.id === defFolder.id);
        if (!exists) {
          db.folders.push(defFolder);
        }
      });
    });

    // Ensure sample presentation deck exists in smart waste project
    const hasPPT = db.files?.some((f: any) => f.name.toLowerCase().endsWith('.pptx') || f.name.toLowerCase().endsWith('.ppt'));
    if (!hasPPT) {
      const pptFile = {
        id: 'file-ncsc-deck-pptx',
        projectId: 'proj-smart-waste-ncsc',
        folderId: 'folder-ppt-proj-smart-waste-ncsc',
        name: 'Smart_Waste_Resource_System_NCSC_Exhibition_Deck.pptx',
        category: 'Presentations & Posters',
        description: 'Complete National Children\'s Science Congress Slide Deck (8 Key Slides: Problem, Multi-Sensor Architecture, AI Classifier, Servo Routing, Recovery Pathways, 50-Trial Empirical Data, and Q&A Defense).',
        size: 58400,
        mimeType: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        storagePath: 'Smart_Waste_Resource_System_NCSC_Exhibition_Deck.pptx',
        isInlineText: true,
        textContent: JSON.stringify({
          title: 'Smart Waste-to-Resource System',
          subtitle: 'NCSC National Finalist Science Exhibition Presentation Deck',
          author: 'Lead Researcher & NCSC Science Innovation Team',
          slides: [
            {
              slideNumber: 1,
              title: 'Smart Waste-to-Resource System',
              subtitle: 'AI-Powered Multi-Sensor Autonomous Segregation & Dual Closed-Loop Recovery',
              keyPoints: [
                'National Children\'s Science Congress — 2026',
                'Project Code: NCSC-2026-ENV-01 | National Finalist',
                'Lead Researcher: NCSC Science Team | Mentor: Dr. S. K. Raman'
              ],
              speakerNotes: 'Welcome judges. Our project tackles municipal solid waste cross-contamination at the immediate point of disposal.'
            },
            {
              slideNumber: 2,
              title: 'Problem Statement: Why Mixed Waste Fails',
              subtitle: 'The Bottleneck in Municipal Solid Waste Recovery',
              keyPoints: [
                'Manual post-collection sorting suffers >40% cross-contamination.',
                'Wet organic leachates permanently soil recyclable plastics and paper.',
                'Synthetic plastic contamination causes anaerobic digester acidification and failure.',
                'Open dumps generate uncontrolled methane and spontaneous landfill fires.'
              ],
              speakerNotes: 'Highlighting that voluntary segregation compliance remains under 35% in public bins.'
            },
            {
              slideNumber: 3,
              title: 'Scientific Hypothesis & Core Principle',
              subtitle: 'Redundant Multi-Modal Sensor Fusion',
              keyPoints: [
                'Hypothesis: Multi-modal sensing (optical camera + capacitive moisture + inductive metal + tare mass) with microsecond servo diverter eliminates contamination by >85%.',
                'Core Principle: IDENTIFY FIRST at the point of ingestion, THEN route each clean stream to dedicated recovery.'
              ],
              speakerNotes: 'Sensory redundancy prevents spoofing (e.g. wet plastic bottles vs organic food waste).'
            },
            {
              slideNumber: 4,
              title: 'System Hardware & Cyber-Physical Pipeline',
              subtitle: 'Integrated Sensing and Microcontroller Routing',
              keyPoints: [
                'Ingestion: 5kg load cell with HX711 24-bit ADC measures gram mass.',
                'Sensing: Stainless moisture probes + LJ12A3 inductive eddy current detector.',
                'AI Vision: MobileNetV3 quantized CNN classifies item in 224x224 RGB.',
                'Actuation: 13 kg-cm metal-gear MG996R servo rotates diverter flap to 135°, 105°, 70°, or 45°.'
              ],
              speakerNotes: 'Total hardware bill of materials is under $75, making it scalable for schools and public parks.'
            },
            {
              slideNumber: 5,
              title: 'Dual Resource Recovery Architecture',
              subtitle: 'Biological & Conceptual Thermochemical Pathways',
              keyPoints: [
                'Wet Stream (135°): Feeds Anaerobic Digestion Drum (60-65% CH4 Biogas) + Aerobic Compost.',
                'Plastic Stream (105°): Feeds shredder & conceptual controlled oxygen-starved pyrolysis reactor with condenser.',
                'Other/Metals (70°): Routed to high-purity secondary metal foundry / glass remelt.',
                'Reject Stream (45°): Quarantine for low-confidence items (<65%) to protect recovery integrity.'
              ],
              speakerNotes: 'The pyrolysis pathway is demonstrated safely as an educational concept without open flame hazards.'
            },
            {
              slideNumber: 6,
              title: 'Empirical Results & Test Validation',
              subtitle: '50 Controlled Trials Across 9 Waste Categories',
              keyPoints: [
                'Overall Segregation Accuracy: 96.4%',
                'Cross-Contamination Rate: 0.0% (Zero synthetic items reached the wet digester)',
                'Average Decision Latency: 820 milliseconds',
                'Successfully processed 1,240g of trial waste across all streams.'
              ],
              speakerNotes: 'Show empirical dataset results: banana peels, PET bottles, aluminium cans, vegetable scraps.'
            },
            {
              slideNumber: 7,
              title: 'Virtual 3D Interactive Exhibition Model',
              subtitle: 'Full-Fidelity Simulation in Three.js WebGL',
              keyPoints: [
                'Real-time physical model running at 60 FPS.',
                'X-Ray, Inside Inspection, Exploded Assembly, and Wireframe views.',
                'Live AI classifier HUD with confidence bar meters and telemetry readouts.'
              ],
              speakerNotes: 'Direct judges to the 3D Simulation tab inside the NCSC Project Vault to run live tests.'
            },
            {
              slideNumber: 8,
              title: 'Conclusions & Societal Impact',
              subtitle: 'Decentralized Clean Circular Economy',
              keyPoints: [
                'Proves low-cost automated source segregation is achievable.',
                'Transforms school canteen waste into cooking biogas and organic fertilizer.',
                'Thank you! Questions and live demonstrations welcomed.'
              ],
              speakerNotes: 'Ready for Q&A defense with exhibition judges.'
            }
          ]
        }, null, 2),
        version: 'v2.0',
        tags: ['PPTX', 'Presentation', 'Slides', 'NCSC Exhibition', 'Judge Defense'],
        createdAt: '2026-10-15T15:00:00.000Z',
        updatedAt: '2026-10-15T18:00:00.000Z',
        downloads: 42,
      };

      if (!db.files) db.files = [];
      db.files.unshift(pptFile);
    }

    // Auto-assign folderId to any files that don't have one
    if (db.files) {
      db.files.forEach((f: any) => {
        if (!f.folderId) {
          f.folderId = getFolderForFile(f.name, f.category, f.projectId || 'proj-smart-waste-ncsc', db.folders);
        }
      });
    }

    return db;
  } catch (err) {
    console.error('Error reading DB, returning initial fallback:', err);
    return {
      admin: {},
      projects: [],
      folders: [],
      files: [],
      experiments: [],
      bom: [],
      auditLogs: []
    };
  }
}

// Write database
function writeDB(data: any) {
  try {
    fs.writeFileSync(DB_FILE, JSON.stringify(data, null, 2), 'utf8');
    return true;
  } catch (err) {
    console.error('Error writing DB:', err);
    return false;
  }
}

// Log audit helper
function addAudit(action: string, actor: string, details: string) {
  const db = readDB();
  const log = {
    id: 'log-' + Date.now(),
    timestamp: new Date().toISOString(),
    action,
    actor,
    details,
  };
  if (!db.auditLogs) db.auditLogs = [];
  db.auditLogs.unshift(log);
  if (db.auditLogs.length > 250) {
    db.auditLogs = db.auditLogs.slice(0, 250);
  }
  writeDB(db);
}

// Static files for public simulations
app.use(express.static(path.join(__dirname, 'public')));

// ----------------- API ROUTES ----------------- //

// 1. Auth: Login (Multi-Admin Authentication)
app.post('/api/auth/login', (req, res) => {
  const { username, password } = req.body;
  const db = readDB();

  if (!username || !password) {
    return res.status(400).json({ error: 'Username/email and password are required.' });
  }

  const hash = crypto.createHash('sha256').update(password).digest('hex');
  const matchedAdmin = (db.admins || []).find((a: any) =>
    (a.username.toLowerCase() === username.toLowerCase() || a.email.toLowerCase() === username.toLowerCase()) &&
    hash === a.passwordHash
  );

  if (!matchedAdmin) {
    addAudit('LOGIN_FAILED', username, 'Failed login attempt with invalid credentials.');
    return res.status(401).json({ error: 'Invalid administrator credentials. Please check your username and password.' });
  }

  matchedAdmin.lastLogin = new Date().toISOString();
  db.admin = matchedAdmin; // fallback sync
  writeDB(db);

  addAudit('LOGIN_SUCCESS', matchedAdmin.username, `Administrator logged in successfully (${matchedAdmin.email} - ${matchedAdmin.role}).`);

  const token = 'ncsc-vault-jwt-' + crypto.randomBytes(24).toString('hex');
  res.json({
    token,
    user: {
      id: matchedAdmin.id,
      username: matchedAdmin.username,
      email: matchedAdmin.email,
      displayName: matchedAdmin.displayName,
      role: matchedAdmin.role,
      institution: matchedAdmin.institution,
      lastLogin: matchedAdmin.lastLogin,
      theme: matchedAdmin.theme || 'dark',
    }
  });
});

// 2. Auth: Get Current Profile
app.get('/api/auth/me', (_req, res) => {
  const db = readDB();
  const admin = db.admin || (db.admins && db.admins[0]);
  res.json({
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
      institution: admin.institution,
      lastLogin: admin.lastLogin,
      theme: admin.theme || 'dark',
      securityQuestion: admin.securityQuestion,
    }
  });
});

// 3. Auth: Update Administrator Profile & Credentials
app.put('/api/auth/profile', (req, res) => {
  const {
    id,
    username,
    email,
    displayName,
    currentPassword,
    newPassword,
    institution,
    securityQuestion,
    securityAnswer
  } = req.body;

  const db = readDB();
  let admin = (db.admins || []).find((a: any) => a.id === id || a.username.toLowerCase() === (username || '').toLowerCase());
  if (!admin) admin = db.admin || db.admins[0];

  if (currentPassword) {
    const currentHash = crypto.createHash('sha256').update(currentPassword).digest('hex');
    if (currentHash !== admin.passwordHash) {
      return res.status(400).json({ error: 'Current password verification failed. Please enter your correct current password.' });
    }
  }

  if (username && username.trim().length >= 3) {
    const cleanU = username.trim().toLowerCase();
    const clash = (db.admins || []).some((a: any) => a.id !== admin.id && a.username.toLowerCase() === cleanU);
    if (clash) return res.status(400).json({ error: 'Username already in use by another administrator.' });
    admin.username = username.trim();
  }
  if (email && email.includes('@')) {
    const cleanE = email.trim().toLowerCase();
    const clash = (db.admins || []).some((a: any) => a.id !== admin.id && a.email.toLowerCase() === cleanE);
    if (clash) return res.status(400).json({ error: 'Email already in use by another administrator.' });
    admin.email = email.trim();
  }
  if (displayName) admin.displayName = displayName.trim();
  if (institution) admin.institution = institution.trim();
  if (securityQuestion) admin.securityQuestion = securityQuestion.trim();
  if (securityAnswer && securityAnswer.trim().length > 0) {
    admin.securityAnswerHash = crypto.createHash('sha256').update(securityAnswer.trim().toLowerCase()).digest('hex');
  }

  if (newPassword && newPassword.trim().length >= 6) {
    admin.passwordHash = crypto.createHash('sha256').update(newPassword.trim()).digest('hex');
    addAudit('PASSWORD_CHANGED', admin.username, 'Administrator password successfully updated.');
  } else {
    addAudit('PROFILE_UPDATED', admin.username, 'Administrator profile details updated.');
  }

  db.admin = admin;
  writeDB(db);

  res.json({
    message: 'Administrator credentials and profile updated successfully!',
    user: {
      id: admin.id,
      username: admin.username,
      email: admin.email,
      displayName: admin.displayName,
      role: admin.role,
      institution: admin.institution,
      lastLogin: admin.lastLogin,
      theme: admin.theme || 'dark',
      securityQuestion: admin.securityQuestion,
    }
  });
});

// 3.1 Multiple Administrator Management: Get all admins
app.get('/api/admins', (_req, res) => {
  const db = readDB();
  const safeAdmins = (db.admins || []).map(({ passwordHash, securityAnswerHash, ...safe }: any) => safe);
  res.json(safeAdmins);
});

// 3.2 Multiple Administrator Management: Add new administrator
app.post('/api/admins', (req, res) => {
  const { username, email, password, displayName, role, institution } = req.body;
  if (!username || username.trim().length < 3) {
    return res.status(400).json({ error: 'Username must be at least 3 characters.' });
  }
  if (!email || !email.includes('@')) {
    return res.status(400).json({ error: 'A valid email address is required.' });
  }
  if (!password || password.trim().length < 6) {
    return res.status(400).json({ error: 'Password must be at least 6 characters.' });
  }

  const db = readDB();
  const cleanUsername = username.trim().toLowerCase();
  const cleanEmail = email.trim().toLowerCase();

  const exists = (db.admins || []).some((a: any) =>
    a.username.toLowerCase() === cleanUsername || a.email.toLowerCase() === cleanEmail
  );
  if (exists) {
    return res.status(400).json({ error: 'An administrator with this username or email already exists.' });
  }

  const newAdmin = {
    id: 'admin-' + Date.now(),
    username: username.trim(),
    email: email.trim(),
    displayName: displayName ? displayName.trim() : username.trim(),
    role: role || 'Co-Administrator',
    institution: institution ? institution.trim() : 'National Children\'s Science Congress (NCSC)',
    passwordHash: crypto.createHash('sha256').update(password.trim()).digest('hex'),
    createdAt: new Date().toISOString(),
    lastLogin: null,
    theme: 'dark',
  };

  if (!db.admins) db.admins = [];
  db.admins.push(newAdmin);
  writeDB(db);

  addAudit('ADMIN_CREATED', db.admin?.username || 'admin', `Created new administrator: "${newAdmin.username}" (${newAdmin.email} - ${newAdmin.role}).`);

  const { passwordHash, ...safe } = newAdmin;
  res.status(201).json(safe);
});

// 3.3 Multiple Administrator Management: Update any administrator
app.put('/api/admins/:id', (req, res) => {
  const { id } = req.params;
  const { username, email, displayName, role, institution, newPassword } = req.body;
  const db = readDB();
  const admin = (db.admins || []).find((a: any) => a.id === id);

  if (!admin) {
    return res.status(404).json({ error: 'Administrator account not found.' });
  }

  if (username && username.trim().length >= 3) {
    const cleanU = username.trim().toLowerCase();
    const clash = (db.admins || []).some((a: any) => a.id !== id && a.username.toLowerCase() === cleanU);
    if (clash) return res.status(400).json({ error: 'Username already in use by another administrator.' });
    admin.username = username.trim();
  }

  if (email && email.includes('@')) {
    const cleanE = email.trim().toLowerCase();
    const clash = (db.admins || []).some((a: any) => a.id !== id && a.email.toLowerCase() === cleanE);
    if (clash) return res.status(400).json({ error: 'Email already in use by another administrator.' });
    admin.email = email.trim();
  }

  if (displayName) admin.displayName = displayName.trim();
  if (role) admin.role = role.trim();
  if (institution) admin.institution = institution.trim();

  if (newPassword && newPassword.trim().length >= 6) {
    admin.passwordHash = crypto.createHash('sha256').update(newPassword.trim()).digest('hex');
    addAudit('ADMIN_PASSWORD_RESET', admin.username, `Updated password for administrator "${admin.username}".`);
  }

  if (db.admin && db.admin.id === id) {
    db.admin = admin;
  }

  writeDB(db);
  addAudit('ADMIN_UPDATED', admin.username, `Updated administrator details for "${admin.username}".`);

  const { passwordHash, securityAnswerHash, ...safe } = admin;
  res.json(safe);
});

// 3.4 Multiple Administrator Management: Delete an administrator
app.delete('/api/admins/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();

  if ((db.admins || []).length <= 1) {
    return res.status(400).json({ error: 'Cannot delete the only remaining administrator account.' });
  }

  const target = (db.admins || []).find((a: any) => a.id === id);
  if (!target) {
    return res.status(404).json({ error: 'Administrator not found.' });
  }

  db.admins = db.admins.filter((a: any) => a.id !== id);
  if (db.admin && db.admin.id === id) {
    db.admin = db.admins[0];
  }

  writeDB(db);
  addAudit('ADMIN_DELETED', target.username, `Deleted administrator account "${target.username}" (${target.email}).`);

  res.json({ message: 'Administrator account deleted successfully.' });
});

// 4. Projects: Get all
app.get('/api/projects', (_req, res) => {
  const db = readDB();
  const projectsWithCounts = db.projects.map((p: any) => {
    const fileCount = db.files.filter((f: any) => f.projectId === p.id).length;
    return {
      ...p,
      fileCount
    };
  });
  res.json(projectsWithCounts);
});

// 5. Projects: Create
app.post('/api/projects', (req, res) => {
  const { name, shortTitle, tagline, description, category, subTheme, leadResearcher, guideTeacher, targetExhibitionDate, tags } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Project name is required.' });
  }

  const db = readDB();
  const id = 'proj-' + Date.now();
  const newProj = {
    id,
    name: name.trim(),
    shortTitle: shortTitle ? shortTitle.trim() : name.trim(),
    code: 'NCSC-2026-PRJ-' + Math.floor(10 + Math.random() * 90),
    tagline: tagline ? tagline.trim() : 'School Science Congress Project',
    description: description ? description.trim() : '',
    category: category || 'Science & Technology',
    subTheme: subTheme || 'Clean Environment & Health',
    leadResearcher: leadResearcher || db.admin.displayName,
    guideTeacher: guideTeacher || 'Science Faculty Advisor',
    status: 'In Progress',
    progress: 15,
    targetExhibitionDate: targetExhibitionDate || '2026-12-01',
    tags: Array.isArray(tags) ? tags : ['NCSC', 'Science'],
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.projects.push(newProj);

  // Initialize default drive folders for this project
  const defFolders = getDefaultFolders(id);
  db.folders.push(...defFolders);

  writeDB(db);
  addAudit('PROJECT_CREATED', db.admin.username, `New project created: "${newProj.name}" (${newProj.id}).`);

  res.status(201).json(newProj);
});

// 6. Projects: Update
app.put('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const index = db.projects.findIndex((p: any) => p.id === id);

  if (index === -1) {
    return res.status(404).json({ error: 'Project not found' });
  }

  db.projects[index] = {
    ...db.projects[index],
    ...req.body,
    updatedAt: new Date().toISOString(),
  };

  writeDB(db);
  addAudit('PROJECT_UPDATED', db.admin.username, `Updated project: "${db.projects[index].name}".`);
  res.json(db.projects[index]);
});

// 7. Projects: Delete
app.delete('/api/projects/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const proj = db.projects.find((p: any) => p.id === id);

  if (!proj) {
    return res.status(404).json({ error: 'Project not found' });
  }

  db.projects = db.projects.filter((p: any) => p.id !== id);
  db.folders = db.folders.filter((f: any) => f.projectId !== id);

  const filesToDelete = db.files.filter((f: any) => f.projectId === id);
  filesToDelete.forEach((f: any) => {
    if (f.storagePath && !f.isStaticPublic && !f.isInlineText) {
      const p = path.join(UPLOADS_DIR, f.storagePath);
      if (fs.existsSync(p)) {
        try { fs.unlinkSync(p); } catch {}
      }
    }
  });
  db.files = db.files.filter((f: any) => f.projectId !== id);

  writeDB(db);
  addAudit('PROJECT_DELETED', db.admin.username, `Deleted project: "${proj.name}".`);
  res.json({ message: 'Project and associated files deleted successfully' });
});

// ----------------- FOLDERS API ----------------- //

// 8. Folders: Get all for project
app.get('/api/folders', (req, res) => {
  const { projectId } = req.query;
  const db = readDB();

  let folders = db.folders || [];
  if (projectId) {
    folders = folders.filter((f: any) => f.projectId === projectId);
  }

  // Calculate file counts and total sizes for each folder
  const foldersWithStats = folders.map((f: any) => {
    const folderFiles = (db.files || []).filter((file: any) => file.folderId === f.id);
    const fileCount = folderFiles.length;
    const totalSize = folderFiles.reduce((acc: number, file: any) => acc + (file.size || 0), 0);
    return {
      ...f,
      fileCount,
      totalSize,
    };
  });

  res.json(foldersWithStats);
});

// 9. Folders: Create custom folder
app.post('/api/folders', (req, res) => {
  const { projectId, name, color, icon, description } = req.body;
  if (!name || !name.trim()) {
    return res.status(400).json({ error: 'Folder name is required.' });
  }

  const db = readDB();
  const id = 'folder-custom-' + Date.now();
  const newFolder = {
    id,
    projectId: projectId || (db.projects[0] ? db.projects[0].id : 'proj-smart-waste-ncsc'),
    name: name.trim(),
    color: color || '#06b6d4',
    icon: icon || 'folder',
    isDefault: false,
    description: description ? description.trim() : 'Custom vault drive folder',
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
  };

  db.folders.push(newFolder);
  writeDB(db);
  addAudit('FOLDER_CREATED', db.admin.username, `Created custom folder: "${newFolder.name}".`);

  res.status(201).json({
    ...newFolder,
    fileCount: 0,
    totalSize: 0,
  });
});

// 10. Folders: Update folder
app.put('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  const { name, color, icon, description } = req.body;
  const db = readDB();
  const folder = db.folders.find((f: any) => f.id === id);

  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  if (name && name.trim()) folder.name = name.trim();
  if (color) folder.color = color;
  if (icon) folder.icon = icon;
  if (description !== undefined) folder.description = description.trim();
  folder.updatedAt = new Date().toISOString();

  writeDB(db);
  addAudit('FOLDER_UPDATED', db.admin.username, `Updated folder: "${folder.name}".`);

  const folderFiles = (db.files || []).filter((file: any) => file.folderId === folder.id);
  res.json({
    ...folder,
    fileCount: folderFiles.length,
    totalSize: folderFiles.reduce((acc: number, f: any) => acc + (f.size || 0), 0),
  });
});

// 11. Folders: Delete folder
app.delete('/api/folders/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const folder = db.folders.find((f: any) => f.id === id);

  if (!folder) {
    return res.status(404).json({ error: 'Folder not found' });
  }

  // If files belong to this folder, reassign them to unassigned / general docs folder
  const targetFolderId = `folder-docs-${folder.projectId}`;
  db.files.forEach((f: any) => {
    if (f.folderId === id) {
      f.folderId = targetFolderId;
    }
  });

  db.folders = db.folders.filter((f: any) => f.id !== id);
  writeDB(db);
  addAudit('FOLDER_DELETED', db.admin.username, `Deleted folder: "${folder.name}". Files moved to default documents.`);

  res.json({ message: 'Folder deleted and files safely reassigned.' });
});

// ----------------- FILES API ----------------- //

// 12. Files: Get files with folder filtering
app.get('/api/files', (req, res) => {
  const { projectId, folderId, category, search } = req.query;
  const db = readDB();
  let list = db.files || [];

  if (projectId) {
    list = list.filter((f: any) => f.projectId === projectId);
  }
  if (folderId && folderId !== 'all') {
    list = list.filter((f: any) => f.folderId === folderId);
  }
  if (category && category !== 'All Files') {
    list = list.filter((f: any) => f.category === category);
  }
  if (search && typeof search === 'string') {
    const q = search.toLowerCase();
    list = list.filter((f: any) =>
      f.name.toLowerCase().includes(q) ||
      (f.description && f.description.toLowerCase().includes(q)) ||
      (f.tags && f.tags.some((t: string) => t.toLowerCase().includes(q)))
    );
  }

  res.json(list);
});

// 13. Files: Upload
app.post('/api/files/upload', upload.array('files', 15), (req, res) => {
  const files = req.files as Express.Multer.File[];
  const { projectId, folderId, category, description, version, tags } = req.body;

  if (!files || files.length === 0) {
    return res.status(400).json({ error: 'No files provided for upload.' });
  }

  const db = readDB();
  const createdFiles: any[] = [];
  const targetProjId = projectId || (db.projects[0] ? db.projects[0].id : 'proj-smart-waste-ncsc');
  const parsedTags = typeof tags === 'string' ? tags.split(',').map(t => t.trim()).filter(Boolean) : (Array.isArray(tags) ? tags : []);

  files.forEach(file => {
    let detectedCategory = category || 'Research Papers & Reports';
    const ext = path.extname(file.originalname).toLowerCase();

    if (!category || category === 'auto') {
      if (['.html', '.htm', '.obj', '.stl', '.gltf', '.glb', '.3ds'].includes(ext)) {
        detectedCategory = '3D Simulations & CAD';
      } else if (['.ino', '.cpp', '.c', '.h', '.py', '.js', '.ts', '.json'].includes(ext)) {
        detectedCategory = 'Source Code & Firmware';
      } else if (['.svg', '.png', '.jpg', '.jpeg', '.webp', '.gif', '.sch', '.brd'].includes(ext)) {
        detectedCategory = 'Hardware & Circuit Schematics';
      } else if (['.csv', '.xlsx', '.xls', '.dat', '.tsv'].includes(ext)) {
        detectedCategory = 'Datasets & Test Results';
      } else if (['.ppt', '.pptx', '.key', '.odp'].includes(ext)) {
        detectedCategory = 'Presentations & Posters';
      } else {
        detectedCategory = 'Research Papers & Reports';
      }
    }

    // Determine target folder: user selected or auto-detected
    let assignedFolderId = folderId;
    if (!assignedFolderId || assignedFolderId === 'auto') {
      assignedFolderId = getFolderForFile(file.originalname, detectedCategory, targetProjId, db.folders);
    }

    const fileDoc = {
      id: 'file-' + Date.now() + '-' + Math.round(Math.random() * 1000),
      projectId: targetProjId,
      folderId: assignedFolderId,
      name: file.originalname,
      category: detectedCategory,
      description: description || `Uploaded ${new Date().toLocaleDateString()} for project documentation`,
      size: file.size,
      mimeType: file.mimetype || 'application/octet-stream',
      storagePath: file.filename,
      isStaticPublic: false,
      version: version || 'v1.0',
      tags: parsedTags.length > 0 ? parsedTags : ['Uploaded', ext.replace('.', '').toUpperCase()],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      downloads: 0,
    };

    db.files.unshift(fileDoc);
    createdFiles.push(fileDoc);
    addAudit('FILE_UPLOADED', db.admin.username, `Uploaded file "${file.originalname}" (${(file.size / 1024).toFixed(1)} KB) to folder "${assignedFolderId}".`);
  });

  writeDB(db);
  res.status(201).json({
    message: `Successfully uploaded ${createdFiles.length} file(s)`,
    files: createdFiles,
  });
});

// 14. Files: Move to Folder
app.put('/api/files/:id/move', (req, res) => {
  const { id } = req.params;
  const { folderId } = req.body;
  const db = readDB();
  const file = db.files.find((f: any) => f.id === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  file.folderId = folderId;
  file.updatedAt = new Date().toISOString();
  writeDB(db);
  addAudit('FILE_MOVED', db.admin.username, `Moved "${file.name}" to folder "${folderId}".`);

  res.json({ message: 'File moved successfully', file });
});

// 15. Files: Download file
app.get('/api/files/:id/download', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const file = db.files.find((f: any) => f.id === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found in vault' });
  }

  file.downloads = (file.downloads || 0) + 1;
  writeDB(db);
  addAudit('FILE_DOWNLOADED', db.admin.username, `Downloaded "${file.name}".`);

  if (file.isStaticPublic) {
    const staticPath = path.join(__dirname, 'public', 'simulations', file.storagePath);
    if (fs.existsSync(staticPath)) {
      return res.download(staticPath, file.name);
    }
  }

  if (file.isInlineText && file.textContent) {
    res.setHeader('Content-Disposition', `attachment; filename="${file.name}"`);
    res.setHeader('Content-Type', file.mimeType || 'text/plain');
    return res.send(file.textContent);
  }

  const filePath = path.join(UPLOADS_DIR, file.storagePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File storage path missing on disk' });
  }

  res.download(filePath, file.name);
});

// 16. Files: Universal Preview
app.get('/api/files/:id/preview', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const file = db.files.find((f: any) => f.id === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found in vault' });
  }

  const ext = path.extname(file.name).toLowerCase();

  // 1. Static public simulations (Three.js 3D simulations)
  if (file.isStaticPublic) {
    return res.json({
      type: 'html',
      url: file.staticUrl || `/simulations/${file.storagePath}`,
      mimeType: file.mimeType,
      name: file.name
    });
  }

  // 2. Presentations (PPTX, PPT)
  if (['.pptx', '.ppt', '.key', '.odp'].includes(ext) || file.category === 'Presentations & Posters') {
    let slideDeckData = null;
    if (file.isInlineText && file.textContent) {
      try {
        slideDeckData = JSON.parse(file.textContent);
      } catch {}
    }

    return res.json({
      type: 'presentation',
      name: file.name,
      mimeType: file.mimeType,
      url: `/api/files/${id}/raw`,
      slides: slideDeckData?.slides || [
        {
          slideNumber: 1,
          title: file.name.replace(/\\.[^/.]+$/, "").replace(/_/g, " "),
          subtitle: "NCSC Science Exhibition Slide Deck",
          keyPoints: [
            "National Children's Science Congress Research Presentation",
            "Project Category: " + file.category,
            "Revision: " + (file.version || "v1.0")
          ],
          speakerNotes: "Welcome judges to the project presentation."
        },
        {
          slideNumber: 2,
          title: "Abstract & Scientific Objective",
          subtitle: "Addressing the Core Challenge",
          keyPoints: [
            "Detailed objective of the science project research.",
            "Methodology overview and hypothesis testing.",
            "Eliminating cross-contamination at the source."
          ],
          speakerNotes: "Walk through the foundational premise of the research."
        },
        {
          slideNumber: 3,
          title: "Hardware & Sensor Architecture",
          subtitle: "Integrated Cyber-Physical Systems",
          keyPoints: [
            "Multi-sensor array integration (Optical + Moisture + Metal + Load Cell).",
            "Microcontroller processing pipeline with ESP32.",
            "Autonomous physical mechanical diverter flap."
          ],
          speakerNotes: "Explain the sensory redundancy."
        },
        {
          slideNumber: 4,
          title: "Empirical Data & Conclusion",
          subtitle: "Results & Societal Impact",
          keyPoints: [
            "High classification accuracy and reliability.",
            "Safe closed-loop circular economy resource recovery.",
            "Q&A session with scientific judges."
          ],
          speakerNotes: "Summarize results and conclude."
        }
      ]
    });
  }

  // 3. Images (JPEG, PNG, WEBP, GIF, SVG)
  if (['.jpg', '.jpeg', '.png', '.webp', '.gif', '.svg', '.bmp', '.ico'].includes(ext)) {
    if (ext === '.svg' && file.isInlineText && file.textContent) {
      return res.json({
        type: 'svg',
        content: file.textContent,
        url: `/api/files/${id}/raw`,
        mimeType: file.mimeType,
        name: file.name,
      });
    }

    return res.json({
      type: 'image',
      url: `/api/files/${id}/raw`,
      mimeType: file.mimeType || 'image/jpeg',
      name: file.name,
    });
  }

  // 4. 3D Models (HTML, STL, OBJ, GLTF, GLB)
  if (['.html', '.htm'].includes(ext)) {
    return res.json({
      type: 'html',
      url: `/api/files/${id}/raw`,
      mimeType: 'text/html',
      name: file.name,
    });
  }
  if (['.stl', '.obj', '.gltf', '.glb'].includes(ext)) {
    return res.json({
      type: '3d',
      url: `/api/files/${id}/raw`,
      format: ext.replace('.', ''),
      mimeType: file.mimeType,
      name: file.name,
    });
  }

  // 5. PDF Documents
  if (ext === '.pdf') {
    return res.json({
      type: 'pdf',
      url: `/api/files/${id}/raw`,
      mimeType: 'application/pdf',
      name: file.name,
    });
  }

  // 6. Spreadsheets (CSV, XLSX, XLS)
  if (['.csv', '.tsv'].includes(ext)) {
    let content = file.textContent;
    if (!content && file.storagePath) {
      const p = path.join(UPLOADS_DIR, file.storagePath);
      if (fs.existsSync(p)) content = fs.readFileSync(p, 'utf8');
    }
    return res.json({
      type: 'spreadsheet',
      content: content || '',
      mimeType: file.mimeType,
      name: file.name,
    });
  }

  // 7. Video and Audio
  if (['.mp4', '.webm', '.ogg', '.mov'].includes(ext)) {
    return res.json({
      type: 'video',
      url: `/api/files/${id}/raw`,
      mimeType: file.mimeType || 'video/mp4',
      name: file.name,
    });
  }
  if (['.mp3', '.wav', '.aac'].includes(ext)) {
    return res.json({
      type: 'audio',
      url: `/api/files/${id}/raw`,
      mimeType: file.mimeType || 'audio/mpeg',
      name: file.name,
    });
  }

  // 8. Markdown / Code / Text files
  if (file.isInlineText && file.textContent) {
    return res.json({
      type: ext === '.md' ? 'markdown' : 'text',
      content: file.textContent,
      mimeType: file.mimeType,
      name: file.name
    });
  }

  const filePath = path.join(UPLOADS_DIR, file.storagePath);
  if (!fs.existsSync(filePath)) {
    return res.status(404).json({ error: 'File data missing on disk' });
  }

  // Check if readable as UTF-8 text
  const textMimes = ['text/plain', 'text/html', 'text/markdown', 'text/csv', 'application/json', 'image/svg+xml'];
  if (textMimes.some(m => file.mimeType.includes(m)) || file.name.match(/\\.(txt|md|csv|json|svg|ino|py|cpp|js|ts|html|sh|yaml|yml)$/i)) {
    const content = fs.readFileSync(filePath, 'utf8');
    return res.json({
      type: ext === '.md' ? 'markdown' : 'text',
      content,
      mimeType: file.mimeType,
      name: file.name,
    });
  }

  // Fallback to raw stream
  res.json({
    type: 'raw',
    url: `/api/files/${id}/raw`,
    mimeType: file.mimeType,
    name: file.name,
  });
});

// 17. Direct raw stream for media, images, and downloads
app.get('/api/files/:id/raw', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const file = db.files.find((f: any) => f.id === id);

  if (!file) return res.status(404).send('Not found');

  if (file.isStaticPublic) {
    return res.sendFile(path.join(__dirname, 'public', 'simulations', file.storagePath));
  }

  if (file.isInlineText && file.textContent) {
    res.setHeader('Content-Type', file.mimeType || 'text/plain');
    return res.send(file.textContent);
  }

  const filePath = path.join(UPLOADS_DIR, file.storagePath);
  if (!fs.existsSync(filePath)) return res.status(404).send('File missing on disk');

  // Set explicit content-type based on extension
  const ext = path.extname(file.name).toLowerCase();
  const mimeMap: Record<string, string> = {
    '.png': 'image/png',
    '.jpg': 'image/jpeg',
    '.jpeg': 'image/jpeg',
    '.webp': 'image/webp',
    '.gif': 'image/gif',
    '.svg': 'image/svg+xml',
    '.pdf': 'application/pdf',
    '.html': 'text/html',
    '.htm': 'text/html',
    '.mp4': 'video/mp4',
    '.mp3': 'audio/mpeg',
  };
  if (mimeMap[ext]) {
    res.setHeader('Content-Type', mimeMap[ext]);
  }

  res.sendFile(filePath);
});

// 18. Files: Update metadata
app.put('/api/files/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const file = db.files.find((f: any) => f.id === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  const { name, folderId, category, description, version, tags, textContent } = req.body;
  if (name) file.name = name.trim();
  if (folderId !== undefined) file.folderId = folderId;
  if (category) file.category = category;
  if (description !== undefined) file.description = description.trim();
  if (version) file.version = version.trim();
  if (tags && Array.isArray(tags)) file.tags = tags;
  if (textContent !== undefined && file.isInlineText) {
    file.textContent = textContent;
    file.size = Buffer.byteLength(textContent, 'utf8');
  }

  file.updatedAt = new Date().toISOString();
  writeDB(db);
  addAudit('FILE_METADATA_UPDATED', db.admin.username, `Updated metadata for "${file.name}".`);

  res.json(file);
});

// 19. Files: Delete
app.delete('/api/files/:id', (req, res) => {
  const { id } = req.params;
  const db = readDB();
  const file = db.files.find((f: any) => f.id === id);

  if (!file) {
    return res.status(404).json({ error: 'File not found' });
  }

  if (!file.isStaticPublic && !file.isInlineText && file.storagePath) {
    const p = path.join(UPLOADS_DIR, file.storagePath);
    if (fs.existsSync(p)) {
      try { fs.unlinkSync(p); } catch {}
    }
  }

  db.files = db.files.filter((f: any) => f.id !== id);
  writeDB(db);
  addAudit('FILE_DELETED', db.admin.username, `Deleted file "${file.name}" from vault.`);

  res.json({ message: 'File permanently removed from vault.' });
});

// 20. Experiments: Get all
app.get('/api/experiments', (_req, res) => {
  const db = readDB();
  res.json(db.experiments || []);
});

// 21. Experiments: Add trial
app.post('/api/experiments', (req, res) => {
  const db = readDB();
  const trial = {
    id: 'exp-' + Date.now(),
    trialNumber: (db.experiments?.length || 0) + 1,
    item: req.body.item || 'Custom Tested Object',
    category: req.body.category || 'Wet Waste',
    mass: req.body.mass || 50,
    moisture: req.body.moisture || 'Moderate',
    metal: req.body.metal || 'No',
    confidence: req.body.confidence || 95,
    routingTimeMs: req.body.routingTimeMs || 750,
    result: req.body.result || 'Success',
    recovery: req.body.recovery || 'Anaerobic Digester',
    date: new Date().toISOString().split('T')[0],
  };

  if (!db.experiments) db.experiments = [];
  db.experiments.unshift(trial);
  writeDB(db);
  addAudit('EXPERIMENT_LOGGED', db.admin.username, `Logged Trial #${trial.trialNumber} (${trial.item} - ${trial.category}).`);
  res.status(201).json(trial);
});

// 22. BOM: Get all
app.get('/api/bom', (_req, res) => {
  const db = readDB();
  res.json(db.bom || []);
});

// 23. BOM: Add/Update
app.post('/api/bom', (req, res) => {
  const db = readDB();
  const item = {
    id: 'bom-' + Date.now(),
    component: req.body.component,
    role: req.body.role,
    specs: req.body.specs,
    cost: parseFloat(req.body.cost) || 0,
    quantity: parseInt(req.body.quantity, 10) || 1,
    status: req.body.status || 'Procured',
  };
  if (!db.bom) db.bom = [];
  db.bom.push(item);
  writeDB(db);
  res.status(201).json(item);
});

// 24. Audit Logs
app.get('/api/audit-logs', (_req, res) => {
  const db = readDB();
  res.json(db.auditLogs || []);
});

// 25. Vault Summary Stats
app.get('/api/vault/stats', (_req, res) => {
  const db = readDB();
  const totalFiles = (db.files || []).length;
  const totalStorageBytes = (db.files || []).reduce((acc: number, f: any) => acc + (f.size || 0), 0);
  const totalProjects = (db.projects || []).length;
  const totalExperiments = (db.experiments || []).length;
  const successfulExperiments = (db.experiments || []).filter((e: any) => e.result?.includes('Success')).length;
  const accuracyRate = totalExperiments > 0 ? Math.round((successfulExperiments / totalExperiments) * 100) : 100;

  const categories: Record<string, number> = {};
  (db.files || []).forEach((f: any) => {
    categories[f.category] = (categories[f.category] || 0) + 1;
  });

  res.json({
    totalFiles,
    totalStorageBytes,
    totalProjects,
    totalExperiments,
    accuracyRate,
    categories,
    recentFiles: (db.files || []).slice(0, 5),
    recentLogs: (db.auditLogs || []).slice(0, 5),
  });
});

// 26. Backup / Export Vault JSON
app.get('/api/vault/backup', (_req, res) => {
  const db = readDB();
  const safeData = {
    ...db,
    admin: {
      username: db.admin.username,
      email: db.admin.email,
      displayName: db.admin.displayName,
      institution: db.admin.institution,
      role: db.admin.role,
    },
    exportTimestamp: new Date().toISOString(),
  };

  res.setHeader('Content-Disposition', `attachment; filename="NCSC_Project_Vault_Backup_${Date.now()}.json"`);
  res.setHeader('Content-Type', 'application/json');
  res.send(JSON.stringify(safeData, null, 2));
});

// Start Server & Vite Integration
async function startServer() {
  const isProd = process.env.NODE_ENV === 'production';

  if (!isProd) {
    const { createServer: createViteServer } = await import('vite');
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static(path.join(__dirname, 'dist')));
    app.get('*', (_req, res) => {
      res.sendFile(path.join(__dirname, 'dist', 'index.html'));
    });
  }

  const server = http.createServer(app);
  server.listen(PORT, '0.0.0.0', () => {
    console.log(`[NCSC VAULT] Server running at http://0.0.0.0:${PORT}`);
  });
}

startServer();
