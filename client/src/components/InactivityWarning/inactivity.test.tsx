import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { InactivityWarning } from './index';

describe('InactivityWarning', () => {
    it('should render when ttlWarning is not null', () => {
        render(<InactivityWarning ttlWarning={30} onExtend={vi.fn()} />);
        expect(screen.getByText(/PURGE IN 30S/i)).toBeDefined();
        expect(screen.getByText(/Critical: Session Instability/i)).toBeDefined();
    });

    it('should call onExtend when button is clicked', () => {
        const onExtend = vi.fn();
        render(<InactivityWarning ttlWarning={30} onExtend={onExtend} />);
        const button = screen.getByText(/STABILIZE CONNECTION/i);
        fireEvent.click(button);
        expect(onExtend).toHaveBeenCalled();
    });

    it('should not render when ttlWarning is null', () => {
        render(<InactivityWarning ttlWarning={null} onExtend={vi.fn()} />);
        expect(screen.queryByText(/PURGE IN/i)).toBeNull();
    });
});
