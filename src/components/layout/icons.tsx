import React from "react";
import {
    Home,
    Book,
    BookOpen,
    FlaskConical,
    Volume2,
    MessageSquare,
    Target,
    Trophy,
    Settings,
    User,
    FileText,
    Calendar,
    Star,
    Heart,
    Flame,
    Zap,
    Rocket,
    Lightbulb,
    Flag,
    Compass,
    Globe,
    Languages,
    Type,
    Mic,
    Video,
    Image,
    Code,
    Server,
    Database,
    Cloud,
    Shield,
    Lock,
    Unlock,
    Key,
    Eye,
    EyeOff,
    Search,
    Filter,
    ArrowUpDown,
    ArrowDownUp,
    RefreshCw,
    RefreshCcw,
    Download,
    Upload,
    Import,
    Plus,
    Minus,
    X,
    Check,
    HelpCircle,
    Info,
    AlertTriangle,
    AlertCircle,
    Ban,
    Trash2,
    Edit,
    Copy,
    Scissors,
    Clipboard,
    Undo,
    Redo,
    RotateCcw,
    Repeat,
    ArrowLeftRight,
    Shrink,
    Maximize,
    ZoomIn,
    ZoomOut,
    Play,
    Pause,
    Square,
    SkipBack,
    SkipForward,
    Rewind,
    FastForward,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    ArrowUpLeft,
    ArrowDownLeft,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    AlignLeft,
    AlignCenter,
    AlignRight,
    LayoutGrid,
    LayoutList,
    LayoutTemplate,
    BarChart3,
    PieChart,
    BarChart,
    ScatterChart,
    LineChart,
    CandlestickChart,
    BoxSelect,
    TrendingUp,
    SlidersHorizontal,
    Monitor,
    Smartphone,
    Tablet,
    AppWindow,
    Mail,
    Link,
    Unlink,
    Printer,
    Share2,
    Network,
    CloudUpload,
    CloudDownload,
    CloudOff,
    Container,
    Building2,
    Banknote,
    Wrench,
    Car,
    Package,
    CircleDot,
    Circle,
    Coffee,
    Terminal,
    Contact,
    Copyright,
    CreditCard,
    Crown,
    Headphones,
    LayoutDashboard,
    Delete,
    Truck,
    Laptop,
    Layout,
    LogOut,
    Command,
    Stethoscope,
    Meh,
    Menu,
    Merge,
    CircleMinus,
    MinusSquare,
    Coins,
    MoreHorizontal,
    GitBranch,
    Bell,
    Hash,
    ListOrdered,
    Paperclip,
    Split,
    Percent,
    Phone,
    PlusCircle,
    PlusSquare,
    CircleDollarSign,
    PoundSterling,
    Power,
    FolderOpen,
    ShieldCheck,
    GitPullRequest,
    Pin,
    QrCode,
    CircleHelp,
    Radar,
    Receipt,
    Bed,
    RotateCw,
    Save,
    Scan,
    Clock,
    Send,
    ShoppingCart,
    ShoppingBag,
    PenTool,
    Palette,
    Smile,
    CheckCircle,
    SwitchCamera,
    Table,
    Tag,
    Tags,
    Users,
    Underline,
    Ungroup,
    List,
    Usb,
    UserPlus,
    UserMinus,
    Verified,
    Wallet,
    Wifi,
} from "lucide-react";

// Kanji Page Icon
export const KanjiPageIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>漢</span>
);

// Radical Icon
export const RadicalIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>部</span>
);

// Grammar Icon
export const GrammarIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>文</span>
);

// Vocabulary Icon
export const VocabularyIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>語</span>
);

// Lesson Icon
export const LessonIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>課</span>
);

// Practice Icon
export const PracticeIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>練</span>
);

// Test Icon
export const TestIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>試</span>
);

// Progress Icon
export const ProgressIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>進</span>
);

// Achievement Icon
export const AchievementIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>成</span>
);

// Study Icon
export const StudyIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>学</span>
);

// Reading Icon
export const ReadingIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>読</span>
);

// Writing Icon
export const WritingIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>書</span>
);

// Listening Icon
export const ListeningIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>聞</span>
);

// Speaking Icon
export const SpeakingIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>話</span>
);

// Conversation Icon
export const ConversationIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>会</span>
);

// AI Icon
export const AIIcon: React.FC<{ style?: React.CSSProperties }> = ({
    style,
}) => (
    <span style={{ ...style, fontWeight: "bold", fontSize: "16px" }}>AI</span>
);

// Export all icons
export {
    Home,
    Book,
    BookOpen,
    FlaskConical,
    Volume2,
    MessageSquare,
    Target,
    Trophy,
    Settings,
    User,
    FileText,
    Calendar,
    Star,
    Heart,
    Flame,
    Zap,
    Rocket,
    Lightbulb,
    Flag,
    Compass,
    Globe,
    Languages,
    Type,
    Mic,
    Video,
    Image,
    Code,
    Server,
    Database,
    Cloud,
    Shield,
    Lock,
    Unlock,
    Key,
    Eye,
    EyeOff,
    Search,
    Filter,
    ArrowUpDown,
    ArrowDownUp,
    RefreshCw,
    RefreshCcw,
    Download,
    Upload,
    Import,
    Plus,
    Minus,
    X,
    Check,
    HelpCircle,
    Info,
    AlertTriangle,
    AlertCircle,
    Ban,
    Trash2,
    Edit,
    Copy,
    Scissors,
    Clipboard,
    Undo,
    Redo,
    RotateCcw,
    Repeat,
    ArrowLeftRight,
    Shrink,
    Maximize,
    ZoomIn,
    ZoomOut,
    Play,
    Pause,
    Square,
    SkipBack,
    SkipForward,
    Rewind,
    FastForward,
    ChevronUp,
    ChevronDown,
    ChevronLeft,
    ChevronRight,
    ArrowUp,
    ArrowDown,
    ArrowLeft,
    ArrowRight,
    ArrowUpRight,
    ArrowDownRight,
    ArrowUpLeft,
    ArrowDownLeft,
    AlignVerticalJustifyStart,
    AlignVerticalJustifyCenter,
    AlignVerticalJustifyEnd,
    AlignLeft,
    AlignCenter,
    AlignRight,
    LayoutGrid,
    LayoutList,
    LayoutTemplate,
    BarChart3,
    PieChart,
    BarChart,
    ScatterChart,
    LineChart,
    CandlestickChart,
    BoxSelect,
    TrendingUp,
    SlidersHorizontal,
    Monitor,
    Smartphone,
    Tablet,
    AppWindow,
    Mail,
    Link,
    Unlink,
    Printer,
    Share2,
    Network,
    CloudUpload,
    CloudDownload,
    CloudOff,
    Container,
    Building2,
    Banknote,
    Wrench,
    Car,
    Package,
    CircleDot,
    Circle,
    Coffee,
    Terminal,
    Contact,
    Copyright,
    CreditCard,
    Crown,
    Headphones,
    LayoutDashboard,
    Delete,
    Truck,
    Laptop,
    Layout,
    LogOut,
    Command,
    Stethoscope,
    Meh,
    Menu,
    Merge,
    CircleMinus,
    MinusSquare,
    Coins,
    MoreHorizontal,
    GitBranch,
    Bell,
    Hash,
    ListOrdered,
    Paperclip,
    Split,
    Percent,
    Phone,
    PlusCircle,
    PlusSquare,
    CircleDollarSign,
    PoundSterling,
    Power,
    FolderOpen,
    ShieldCheck,
    GitPullRequest,
    Pin,
    QrCode,
    CircleHelp,
    Radar,
    Receipt,
    Bed,
    RotateCw,
    Save,
    Scan,
    Clock,
    Send,
    ShoppingCart,
    ShoppingBag,
    PenTool,
    Palette,
    Smile,
    CheckCircle,
    SwitchCamera,
    Table,
    Tag,
    Tags,
    Users,
    Underline,
    Ungroup,
    List,
    Usb,
    UserPlus,
    UserMinus,
    Verified,
    Wallet,
    Wifi,
};