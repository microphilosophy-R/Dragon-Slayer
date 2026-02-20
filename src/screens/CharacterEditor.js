import React, { useState, useEffect } from 'react';
import { Button } from '../components/ui/Button';
import { CHARACTERS } from '../data/characters';
import { SKILL_CABINET } from '../data/skills';
import { CharacterCard } from '../components/ui/CharacterCard';
import { ArrowLeft, Copy, Plus, Trash2, Check, Upload, AlertTriangle, Save, Undo } from 'lucide-react';

const INITIAL_STATE = {
    id: '',
    name: '',
    role: '',
    hp: 1,
    maxHp: 1,
    speed: 1,
    skills: [],
    description: '',
    score: 0.00,
    profileFilename: ''
};

export const CharacterEditor = ({ onBack }) => {
    const [selectedId, setSelectedId] = useState('new');
    const [formData, setFormData] = useState(INITIAL_STATE);
    const [savedData, setSavedData] = useState(INITIAL_STATE); // Track clean state
    const [copied, setCopied] = useState(false);
    const [imagePreview, setImagePreview] = useState(null);
    const [imageWarning, setImageWarning] = useState('');

    useEffect(() => {
        let newData = INITIAL_STATE;
        if (selectedId !== 'new') {
            const char = CHARACTERS[selectedId];
            if (char) {
                newData = {
                    id: char.id || '',
                    name: char.name || '',
                    role: char.role || '',
                    hp: char.hp || 1,
                    maxHp: char.maxHp || 1,
                    speed: char.speed || 1,
                    skills: char.skills ? [...char.skills] : [],
                    description: char.description || '',
                    score: char.score || 0.00,
                    profileFilename: ''
                };
            }
        }
        setFormData(newData);
        setSavedData(newData);
        setCopied(false);
        setImagePreview(null);
        setImageWarning('');
    }, [selectedId]);

    const isDirty = JSON.stringify(formData) !== JSON.stringify(savedData);

    const handleBack = () => {
        if (isDirty) {
            if (!window.confirm("You have unsaved changes. Are you sure you want to exit?")) {
                return;
            }
        }
        onBack();
    };

    const handleLoadChange = (e) => {
        if (isDirty) {
            if (!window.confirm("You have unsaved changes. Change character anyway?")) {
                return;
            }
        }
        setSelectedId(e.target.value);
    };

    const handleSave = () => {
        setSavedData(formData);

        // Push working copy to session memory for playtesting
        CHARACTERS[formData.id] = {
            ...(CHARACTERS[formData.id] || {}),
            ...formData,
            skills: [...formData.skills],
            profile: imagePreview || (CHARACTERS[formData.id] ? CHARACTERS[formData.id].profile : '')
        };

        setCopied(false);
    };

    const handleUndo = () => {
        if (isDirty && window.confirm("Revert all unsaved changes?")) {
            setFormData(savedData);
            setCopied(false);
        }
    };

    const handleInputChange = (e) => {
        const { name, value, type } = e.target;
        let finalValue = value;
        if (type === 'number') {
            finalValue = value === '' ? '' : Number(value);
        }
        setFormData(prev => ({
            ...prev,
            [name]: finalValue
        }));
        setCopied(false);
    };

    const handleSkillChange = (index, value) => {
        const newSkills = [...formData.skills];
        newSkills[index] = value;
        setFormData(prev => ({ ...prev, skills: newSkills }));
        setCopied(false);
    };

    const addSkill = () => {
        setFormData(prev => ({ ...prev, skills: [...prev.skills, ''] }));
        setCopied(false);
    };

    const removeSkill = (index) => {
        const newSkills = [...formData.skills];
        newSkills.splice(index, 1);
        setFormData(prev => ({ ...prev, skills: newSkills }));
        setCopied(false);
    };

    const handleImageUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        setImageWarning('');
        setFormData(prev => ({ ...prev, profileFilename: file.name }));
        setCopied(false);

        const reader = new FileReader();
        reader.onload = (event) => {
            const dataUrl = event.target.result;
            setImagePreview(dataUrl);

            // Check dimensions
            const img = new Image();
            img.onload = () => {
                const ratio = img.width / img.height;
                // Target ratio is 4:5 (which is 0.8)
                const targetRatio = 4 / 5;
                const tolerance = 0.05; // 5% tolerance
                if (Math.abs(ratio - targetRatio) > tolerance) {
                    setImageWarning(`Warning: Image aspect ratio is ${(ratio).toFixed(2)}. Recommended is 0.80 (4:5) for portraits.`);
                }
            };
            img.src = dataUrl;
        };
        reader.readAsDataURL(file);
    };

    // Prepare preview character for the Card
    const previewChar = {
        id: formData.id || 'preview',
        name: formData.name || 'Unknown Hero',
        role: formData.role || 'Unassigned',
        hp: formData.hp || 1,
        maxHp: formData.maxHp || 1,
        speed: formData.speed || 1,
        defense: 0, // Default for preview
        skills: [], // The Card component handles this with getSkills or skillIds
        skillIds: formData.skills.filter(s => s !== ''),
        description: formData.description || '',
        score: formData.score || 0.00,
        profile: imagePreview || (CHARACTERS[selectedId] ? CHARACTERS[selectedId].profile : '')
    };

    const generateCode = () => {
        const lines = [
            `    ${formData.id || 'new_character'}: {`,
            `        id: '${formData.id || ''}',`,
            `        name: '${formData.name || ''}',`,
            `        role: '${formData.role || ''}',`,
            `        hp: ${formData.hp || 1},`,
            `        maxHp: ${formData.maxHp || 1},`,
            `        speed: ${formData.speed || 1},`,
            `        skills: [${formData.skills.map(s => `'${s}'`).join(', ')}],`,
            `        description: '${(formData.description || '').replace(/'/g, "\\'")}',`,
            ...(formData.profileFilename ? [`        profile: '/* IMPORT ${formData.profileFilename} */',`] : []),
            `        score: ${formData.score || 0.00},`,
            `        evaluationTime: '${new Date().toISOString()}'`,
            `    }`
        ];
        return lines.join('\n');
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(generateCode());
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="min-h-screen bg-stone-950 text-stone-200 p-8 flex flex-col font-serif">
            <div className="max-w-4xl mx-auto w-full flex-1 flex flex-col">
                {/* Header */}
                <div className="flex items-center justify-between mb-8 pb-4 border-b border-stone-800">
                    <div className="flex items-center gap-4">
                        <Button onClick={handleBack} icon={ArrowLeft}>BACK</Button>
                        <h1 className="text-3xl text-amber-500 font-bold flex items-center gap-4" style={{ fontFamily: '"MedievalSharp", cursive' }}>
                            Character Editor
                            {isDirty && <span className="text-sm text-red-500 font-sans tracking-tight">*(Unsaved Changes)*</span>}
                        </h1>
                    </div>
                    <div className="flex gap-4">
                        <Button
                            onClick={handleUndo}
                            icon={Undo}
                            disabled={!isDirty}
                            className={!isDirty ? 'opacity-30 cursor-not-allowed' : ''}
                        >
                            UNDO
                        </Button>
                        <Button
                            onClick={handleSave}
                            icon={Save}
                            disabled={!isDirty}
                            className={!isDirty ? 'opacity-30 cursor-not-allowed' : 'bg-green-900/40 text-green-400 border-green-700 hover:bg-green-900/60'}
                        >
                            SAVE
                        </Button>
                    </div>
                </div>

                {/* Content */}
                <div className="flex flex-col md:flex-row gap-8 flex-1 min-h-[500px]">
                    {/* Left Column: Form */}
                    <div className="md:w-2/3 flex flex-col space-y-6 bg-stone-900 border border-stone-800 p-6 rounded shadow-lg overflow-y-auto overflow-x-hidden scrollbar-thin scrollbar-thumb-amber-900 scrollbar-track-stone-900 h-full max-h-[70vh]">
                        <div>
                            <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">Load Existing</label>
                            <select
                                value={selectedId}
                                onChange={handleLoadChange}
                                className="w-full bg-stone-950 border border-stone-700 rounded p-2 text-stone-200 focus:border-amber-600 outline-none"
                            >
                                <option value="new">-- New Character --</option>
                                {Object.values(CHARACTERS).map(c => (
                                    <option key={c.id} value={c.id}>{c.name} ({c.id})</option>
                                ))}
                            </select>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">ID</label>
                                <input type="text" name="id" value={formData.id} onChange={handleInputChange} className="w-full bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none" placeholder="e.g. arthur" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">Name</label>
                                <input type="text" name="name" value={formData.name} onChange={handleInputChange} className="w-full bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none" placeholder="e.g. King Arthur" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">Role</label>
                                <input type="text" name="role" value={formData.role} onChange={handleInputChange} className="w-full bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none" placeholder="e.g. Knight" />
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">Score</label>
                                <input type="number" step="0.01" name="score" value={formData.score} onChange={handleInputChange} className="w-full bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none" />
                            </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 border-t border-stone-800 pt-4">
                            <div>
                                <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">HP / Max HP</label>
                                <div className="flex gap-2">
                                    <input type="number" name="hp" value={formData.hp} onChange={handleInputChange} className="w-full bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none" />
                                    <span className="self-center">/</span>
                                    <input type="number" name="maxHp" value={formData.maxHp} onChange={handleInputChange} className="w-full bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none" />
                                </div>
                            </div>
                            <div>
                                <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">Speed</label>
                                <input type="number" name="speed" value={formData.speed} onChange={handleInputChange} className="w-full bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none" />
                            </div>
                        </div>

                        <div className="border-t border-stone-800 pt-4">
                            <label className="block text-sm text-stone-400 mb-2 uppercase tracking-wider">Skills</label>
                            {formData.skills.map((skill, index) => (
                                <div key={index} className="flex gap-2 mb-2">
                                    <select
                                        value={skill}
                                        onChange={(e) => handleSkillChange(index, e.target.value)}
                                        className="flex-1 bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none"
                                    >
                                        <option value="">-- Select Skill --</option>
                                        {Object.values(SKILL_CABINET).map(s => (
                                            <option key={s.id} value={s.id}>{s.name} ({s.id})</option>
                                        ))}
                                    </select>
                                    <button
                                        onClick={() => removeSkill(index)}
                                        className="p-2 bg-red-900/30 text-red-500 hover:bg-red-900/50 rounded border border-red-900/50 transition-colors"
                                    >
                                        <Trash2 size={18} />
                                    </button>
                                </div>
                            ))}
                            <button
                                onClick={addSkill}
                                className="flex items-center gap-2 text-amber-500 hover:text-amber-400 text-sm mt-2 focus:outline-none"
                            >
                                <Plus size={16} /> ADD SKILL
                            </button>
                        </div>

                        <div className="border-t border-stone-800 pt-4">
                            <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">Description</label>
                            <textarea
                                name="description"
                                value={formData.description}
                                onChange={handleInputChange}
                                className="w-full bg-stone-950 border border-stone-700 rounded p-2 focus:border-amber-600 outline-none h-24 resize-none"
                                placeholder="Character description..."
                            />
                        </div>
                        <div className="border-t border-stone-800 pt-4">
                            <label className="block text-sm text-stone-400 mb-1 uppercase tracking-wider">Portrait Image</label>

                            <div className="flex items-start gap-4 mt-2">
                                <div className="flex-1">
                                    <label className="flex items-center justify-center gap-2 w-full bg-stone-950 border border-stone-700 hover:border-amber-600 rounded p-4 cursor-pointer text-stone-400 hover:text-amber-500 transition-colors">
                                        <Upload size={20} />
                                        <span>Select Image File</span>
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            className="hidden"
                                        />
                                    </label>

                                    {formData.profileFilename && (
                                        <p className="text-xs text-stone-500 mt-2 truncate">
                                            File: {formData.profileFilename}
                                        </p>
                                    )}

                                    {imageWarning && (
                                        <div className="mt-3 flex items-start gap-2 bg-yellow-900/20 border border-yellow-700/50 text-yellow-500 p-3 rounded text-sm">
                                            <AlertTriangle size={16} className="shrink-0 mt-0.5" />
                                            <p>{imageWarning}</p>
                                        </div>
                                    )}
                                </div>

                                {imagePreview && (
                                    <div className="w-24 h-30 shrink-0 bg-stone-950 border border-stone-700 rounded overflow-hidden flex items-center justify-center">
                                        <img src={imagePreview} alt="Preview" className="w-full h-full object-cover" />
                                    </div>
                                )}
                            </div>
                        </div>

                    </div>

                    {/* Right Column: Preview & Output */}
                    <div className="md:w-1/3 flex flex-col gap-4 h-full max-h-[70vh]">
                        {/* Card Preview */}
                        <div className="bg-stone-900 border border-stone-800 rounded p-4 flex flex-col items-center justify-center relative overflow-hidden shrink-0 shadow-lg">
                            <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm mb-4 self-start">Live Preview</h3>
                            <div className="transform scale-[0.8] origin-top h-[25.6rem]">
                                <CharacterCard
                                    char={previewChar}
                                    isSelected={true}
                                    isActive={false}
                                    isTargetable={false}
                                />
                            </div>
                        </div>

                        {/* Code Output */}
                        <div className="bg-stone-900 border border-stone-800 rounded p-4 flex-1 flex flex-col min-h-[200px]">
                            <div className="flex items-center justify-between mb-2">
                                <h3 className="text-amber-500 font-bold uppercase tracking-wider text-sm">Generated Code</h3>
                                <button
                                    onClick={handleCopy}
                                    className={`flex items-center gap-1 text-xs px-2 py-1 rounded transition-colors ${copied ? 'bg-green-900/50 text-green-400 border border-green-700' : 'bg-stone-800 text-stone-300 hover:bg-stone-700 border border-stone-700'}`}
                                >
                                    {copied ? <Check size={14} /> : <Copy size={14} />}
                                    {copied ? 'COPIED' : 'COPY'}
                                </button>
                            </div>
                            <pre className="flex-1 bg-stone-950 p-4 rounded overflow-y-auto text-xs text-stone-300 border border-stone-800 font-mono">
                                <code>{generateCode()}</code>
                            </pre>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};
