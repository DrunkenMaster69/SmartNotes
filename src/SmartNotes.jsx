import { useState, useEffect } from "react";
import { formatDistanceToNow, parseISO } from "date-fns";

// Simple reusable components defined inline
function Input({ type = "text", value, placeholder, onChange }) {
    return (
        <input
            type={type}
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className="w-full p-2 border rounded"
        />
    );
}

function Textarea({ value, placeholder, onChange }) {
    return (
        <textarea
            value={value}
            placeholder={placeholder}
            onChange={onChange}
            className="w-full p-2 border rounded"
            rows="3"
        />
    );
}

function Button({ children, onClick, variant = "primary" }) {
    const baseStyle = "px-4 py-2 rounded font-semibold";
    const styles = {
        primary: `${baseStyle} bg-blue-500 text-white hover:bg-blue-600`,
        destructive: `${baseStyle} bg-red-500 text-white hover:bg-red-600`,
    };
    return (
        <button onClick={onClick} className={styles[variant]}>
            {children}
        </button>
    );
}

function Card({ children, className = "" }) {
    return (
        <div className={`border rounded-lg shadow-md ${className}`}>
            {children}
        </div>
    );
}

function CardContent({ children }) {
    return <div className="p-4">{children}</div>;
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
        <div className="p-6 max-w-2xl mx-auto space-y-4">
            <h1 className="text-2xl font-bold">Smart Notes</h1>
            {/* Search */}
            <Input
                placeholder="Search notes..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Add Note Form */}
            <Card>
                <CardContent className="space-y-3">
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
            {filteredNotes.length > 0 ? (
                filteredNotes.map((note) => {
                    const isUrgent =
                        note.deadline && new Date(note.deadline) < new Date();
                    return (
                        <Card
                            key={note.id}
                            className={isUrgent ? "border-red-500" : ""}
                        >
                            <CardContent>
                                <h2 className="text-lg font-semibold">{note.title}</h2>
                                <p>{note.content}</p>
                                {note.deadline && (
                                    <p className="text-sm text-gray-500">
                                        Due{" "}
                                        {formatDistanceToNow(parseISO(note.deadline), {
                                            addSuffix: true,
                                        })}
                                    </p>
                                )}
                                <Button
                                    variant="destructive"
                                    onClick={() => deleteNote(note.id)}
                                >
                                    Delete
                                </Button>
                            </CardContent>
                        </Card>
                    );
                })
            ) : (
                <p className="text-gray-500">No notes found.</p>
            )}
        </div>
    );
}
