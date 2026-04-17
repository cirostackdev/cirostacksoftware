'use client';

import { useRouter } from 'next/navigation';
import Button from '@/components/ui/Button';
import { useAuthStore } from '@/lib/store/useAuthStore';

interface Props {
  courseId: string;
  slug: string;
}

export default function EnrolButton({ courseId, slug }: Props) {
  const router = useRouter();
  const { isLoggedIn } = useAuthStore();

  const handleClick = () => {
    if (!isLoggedIn) {
      router.push(`/auth/login?redirect=/checkout/course?courseId=${courseId}&slug=${slug}`);
    } else {
      router.push(`/checkout/course?courseId=${courseId}&slug=${slug}`);
    }
  };

  return (
    <Button fullWidth size="lg" onClick={handleClick} className="mb-3">
      Enrol now
    </Button>
  );
}
