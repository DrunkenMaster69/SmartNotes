import { useState, useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";

// Reusable components with improved styling
function Input({ type = "text", value, placeholder, onChange }) {
    return (
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className="input"
        />
    );
}

function Textarea({ value, placeholder, onChange }) {
    return (
        <textarea
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
            rows="4"
        />
    );
}

function Button({ children, onClick, variant = "primary" }) {
    const baseStyle = "px-6 py-3 rounded-lg font-semibold transition-all transform hover:scale-105 active:scale-95";
    const styles = {
        primary: `${baseStyle} bg-blue-500 text-white hover:bg-blue-600 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2`,
        destructive: `${baseStyle} bg-red-500 text-white hover:bg-red-600 focus:ring-2 focus:ring-red-500 focus:ring-offset-2`,
    };
    return (
        <button onClick={onClick} className={styles[variant]}>
            {children}
        </button>
    );
}

function Card({ children, className = "", isUrgent = false }) {
    return (
        <div
            className={`border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow ${
                isUrgent ? "border-red-500 bg-red-50" : "bg-white"
            } ${className}`}
        >
            {children}
        </div>
    );
}

function CardContent({ children }) {
    return <div className="p-5 space-y-4">{children}</div>;
}

export default function SmartNotes() {
    const [notes, setNotes] = useState([]);
    const [searchTerm, setSearchTerm] = useState("");
    const [newNote, setNewNote] = useState({
        title: "",
        content: "",
        deadline: "",
    });

    // Load notes from local storage on mount
    useEffect(() => {
        const savedNotes = JSON.parse(localStorage.getItem("smartnotes")) || [];
        setNotes(savedNotes);
    }, []);

    // Save notes to local storage on change
    useEffect(() => {
        localStorage.setItem("smartnotes", JSON.stringify(notes));
    }, [notes]);

    const addNote = () => {
        if (!newNote.title.trim() || !newNote.content.trim()) return;
        const updatedNotes = [
            ...notes,
            { ...newNote, id: Date.now() },
        ];
        setNotes(updatedNotes);
        setNewNote({ title: "", content: "", deadline: "" });
    };

    const deleteNote = (id) => {
        setNotes(notes.filter((note) => note.id !== id));
    };

    const filteredNotes = notes.filter(
        (note) =>
            note.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
            note.content.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-6 max-w-2xl mx-auto space-y-6">
            <h1 className="text-3xl font-bold text-center text-gray-800">Smart Notes</h1>

            {/* Search */}
            <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Add Note Form */}
            <Card>
                <CardContent>
                    <h2 className="text-xl font-semibold text-gray-700">Add New Note</h2>
                    <Input
                        placeholder="Title"
                        value={newNote.title}
                        onChange={(e) =>
                            setNewNote({ ...newNote, title: e.target.value })
                        }
                    />
                    <Textarea
                        placeholder="Content"
                        value={newNote.content}
                        onChange={(e) =>
                            setNewNote({ ...newNote, content: e.target.value })
                        }
                    />
                    <Input
                        type="datetime-local"
                        value={newNote.deadline}
                        onChange={(e) =>
                            setNewNote({ ...newNote, deadline: e.target.value })
                        }
                    />
                    <Button onClick={addNote}>Add Note</Button>
                </CardContent>
            </Card>

            {/* Notes List */}
            <div className="space-y-4">
                {filteredNotes.length > 0 ? (
                    filteredNotes.map((note) => {
                        const isUrgent =
                            note.deadline && new Date(note.deadline) < new Date();
                        return (
                            <Card key={note.id} isUrgent={isUrgent}>
                                <CardContent>
                                    <h2 className="text-xl font-semibold text-gray-800">{note.title}</h2>
                                    <p className="text-gray-600">{note.content}</p>
                                    {note.deadline && (
                                        <p className={`text-sm ${
                                            isUrgent ? "text-red-600" : "text-gray-500"
                                        }`}>
                                            Due{" "}
                                            {formatDistanceToNow(parseISO(note.deadline), {
                                                addSuffix: true,
                                            })}
                                        </p>
                                    )}
                                    <div className="flex justify-end">
                                        <Button
                                            variant="destructive"
                                            onClick={() => deleteNote(note.id)}
                                        >
                                            Delete
                                        </Button>
                                    </div>
                                </CardContent>
                            </Card>
                        );
                    })
                ) : (
                    <p className="text-center text-gray-500">No notes found.</p>
                )}
            </div>
        </div>
    );
}
