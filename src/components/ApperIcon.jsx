import { 
  Calendar, CalendarDays, Users, DollarSign, Building2, CreditCard, List,
  Plus, Search, X, Mail, MapPin, Clock, ChevronLeft, ChevronRight,
  TrendingUp, TrendingDown, AlertTriangle, Check, Send, FileText,
  Building, Smartphone, Info, Trash2, Edit, Eye, Moon, Sun, Award,
  Star, StarHalf
} from 'lucide-react'

const iconMap = {
  Calendar,
  CalendarDays,
  Users,
  DollarSign,
  Building2,
  CreditCard,
  List,
  Plus,
  Search,
  X,
  Mail,
  MapPin,
  Clock,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Check,
  Send,
  FileText,
  Building,
  Smartphone,
  Info,
  Trash2,
  Edit,
  Eye,
  Moon,
  Sun,
  Award,
  Star,
  StarHalf
}

const ApperIcon = ({ name, className = "w-6 h-6", ...props }) => {
  const IconComponent = iconMap[name]
  
  if (!IconComponent) {
    console.warn(`Icon "${name}" not found`)
    return null
  }
  
  return <IconComponent className={className} {...props} />
}

export default ApperIcon
