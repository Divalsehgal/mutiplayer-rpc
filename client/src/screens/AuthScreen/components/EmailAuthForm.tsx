import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import React from 'react';


interface AuthFormData {
  user_name?: string;
  email: string;
  password: string;
}

interface EmailAuthFormProps {
  isLogin: boolean;
  formData: AuthFormData;
  onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
  onSubmit: (e: React.FormEvent) => void;
  isLoading: boolean;
}

export const EmailAuthForm: React.FC<EmailAuthFormProps> = ({
  isLogin,
  formData,
  onChange,
  onSubmit,
  isLoading
}) => {
  return (
    <form onSubmit={onSubmit} className="space-y-4">
      {!isLogin && (
        <div className="space-y-2">
          <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">USERNAME</label>
          <Input
            name="user_name"
            placeholder="HOW SHALL WE CALL YOU?"
            value={formData.user_name}
            onChange={onChange}
            required
            className="h-12 border-2 focus-visible:ring-primary font-bold"
          />
        </div>
      )}
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">EMAIL ADDRESS</label>
        <Input
          name="email"
          type="email"
          placeholder="YOU@EXAMPLE.COM"
          value={formData.email}
          onChange={onChange}
          required
          className="h-12 border-2 focus-visible:ring-primary font-bold"
        />
      </div>
      <div className="space-y-2">
        <label className="text-xs font-bold uppercase tracking-widest text-muted-foreground ml-1">PASSWORD</label>
        <Input
          name="password"
          type="password"
          placeholder="••••••••"
          value={formData.password}
          onChange={onChange}
          required
          className="h-12 border-2 focus-visible:ring-primary font-bold"
        />
      </div>
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full h-14 text-lg font-black italic tracking-widest mt-4 shadow-lg"
      >
        {isLoading ? 'PROCESSING...' : isLogin ? 'ENTER ARENA' : 'CREATE ACCOUNT'}
      </Button>
    </form>
  );
};
