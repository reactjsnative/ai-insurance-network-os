import type { LucideIcon } from "lucide-react";
import {
  BookOpen,
  Boxes,
  Code2,
  Layers3,
  Rocket,
  Settings,
  ShieldCheck,
  Users,
  Workflow,
} from "lucide-react";

export type MegaMenuLink = {
  title: string;
  description: string;
  href: string;
  icon: LucideIcon;
};

export type MegaMenuCategory = {
  id: string;
  title: string;
  icon: LucideIcon;
  heading: string;
  description: string;
  links: MegaMenuLink[];
};

export const megaMenuCategories: MegaMenuCategory[] = [
  {
    id: "services",
    title: "บริการ",
    icon: Layers3,
    heading: "บริการสำหรับการทำงาน",
    description: "เลือกบริการที่เหมาะสมกับโครงการและทีมของคุณ",
    links: [
      {
        title: "จัดการโครงการ",
        description: "สร้างและติดตามงานทั้งหมดจากพื้นที่เดียว",
        href: "/services/projects",
        icon: Boxes,
      },
      {
        title: "ระบบอัตโนมัติ",
        description: "สร้างขั้นตอนการทำงานเพื่อลดงานซ้ำ",
        href: "/services/automation",
        icon: Workflow,
      },
      {
        title: "การตั้งค่าระบบ",
        description: "กำหนดรูปแบบและเงื่อนไขการทำงาน",
        href: "/services/settings",
        icon: Settings,
      },
      {
        title: "ระบบความปลอดภัย",
        description: "จัดการสิทธิ์และปกป้องข้อมูลสำคัญ",
        href: "/services/security",
        icon: ShieldCheck,
      },
    ],
  },
  {
    id: "solutions",
    title: "โซลูชัน",
    icon: Rocket,
    heading: "โซลูชันสำหรับทุกขนาดทีม",
    description: "รองรับตั้งแต่ผู้ใช้งานรายบุคคลจนถึงองค์กร",
    links: [
      {
        title: "ผู้ใช้งานทั่วไป",
        description: "เครื่องมือเริ่มต้นสำหรับจัดการงานส่วนตัว",
        href: "/solutions/individual",
        icon: Users,
      },
      {
        title: "ทีมงาน",
        description: "ทำงานร่วมกันและติดตามความคืบหน้า",
        href: "/solutions/teams",
        icon: Users,
      },
      {
        title: "นักพัฒนา",
        description: "เชื่อมต่อและพัฒนาฟังก์ชันเพิ่มเติม",
        href: "/solutions/developers",
        icon: Code2,
      },
      {
        title: "องค์กร",
        description: "รองรับระบบขนาดใหญ่และผู้ใช้จำนวนมาก",
        href: "/solutions/enterprise",
        icon: Layers3,
      },
    ],
  },
  {
    id: "resources",
    title: "แหล่งเรียนรู้",
    icon: BookOpen,
    heading: "คู่มือและแหล่งเรียนรู้",
    description: "ศึกษาวิธีใช้งานและตัวอย่างการพัฒนาระบบ",
    links: [
      {
        title: "เริ่มต้นใช้งาน",
        description: "เรียนรู้ขั้นตอนการตั้งค่าระบบครั้งแรก",
        href: "/guides/getting-started",
        icon: Rocket,
      },
      {
        title: "คู่มือการใช้งาน",
        description: "อ่านรายละเอียดเกี่ยวกับฟังก์ชันต่าง ๆ",
        href: "/guides",
        icon: BookOpen,
      },
      {
        title: "ตัวอย่างโครงการ",
        description: "ดูตัวอย่างเพื่อนำไปประยุกต์ใช้งาน",
        href: "/examples",
        icon: Boxes,
      },
      {
        title: "เอกสารสำหรับนักพัฒนา",
        description: "ศึกษารูปแบบการเชื่อมต่อระบบ",
        href: "/developers",
        icon: Code2,
      },
    ],
  },
];
