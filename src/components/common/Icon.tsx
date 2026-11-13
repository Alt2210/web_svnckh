import { ArrowRight, Award, BadgeCheck, Bell, BookOpen, Calendar, CalendarDays, CheckCheck, ChevronDown, ChevronRight, Circle, CircleCheck, CirclePlay, ClipboardCheck, Clock, Compass, Download, FileCheck, FileText, FlaskConical, Globe, GraduationCap, Handshake, Headset, Hourglass, Info, Landmark, LogIn, Mail, Map, MapPin, Medal, Menu, MessagesSquare, Monitor, Network, Phone, Rocket, Search, Send, Shield, ShieldCheck, Sparkles, Trophy, User, UserCheck, UserPlus, Users, Workflow, type LucideProps } from 'lucide-react';

const icons = {
  account_balance: Landmark,
  account_tree: Network,
  admin_panel_settings: ShieldCheck,
  arrow_forward: ArrowRight,
  article: FileText,
  assignment_turned_in: ClipboardCheck,
  calendar_today: Calendar,
  call: Phone,
  check_circle: CircleCheck,
  chevron_right: ChevronRight,
  computer: Monitor,
  description: FileText,
  done_all: CheckCheck,
  download: Download,
  emoji_events: Trophy,
  event_note: CalendarDays,
  expand_more: ChevronDown,
  explore: Compass,
  forum: MessagesSquare,
  group_add: UserPlus,
  groups: Users,
  handshake: Handshake,
  hourglass_top: Hourglass,
  how_to_reg: UserCheck,
  hub: Network,
  info: Info,
  lan: Workflow,
  location_on: MapPin,
  login: LogIn,
  mail: Mail,
  map: Map,
  menu: Menu,
  menu_book: BookOpen,
  military_tech: Medal,
  notifications: Bell,
  person: User,
  pin_drop: MapPin,
  play_circle: CirclePlay,
  policy: FileCheck,
  public: Globe,
  rocket_launch: Rocket,
  schedule: Clock,
  school: GraduationCap,
  science: FlaskConical,
  search: Search,
  send: Send,
  shield: Shield,
  stars: Sparkles,
  support_agent: Headset,
  task_alt: CircleCheck,
  travel_explore: Search,
  verified: BadgeCheck,
  verified_user: ShieldCheck,
  workspace_premium: Award,
};

export type IconName = keyof typeof icons;

interface IconProps extends LucideProps { name: IconName }

export function Icon({ name, className = '', ...props }: IconProps) {
  const Component = icons[name] ?? Circle;
  return <Component className={`icon ${className}`} aria-hidden="true" {...props} />;
}
