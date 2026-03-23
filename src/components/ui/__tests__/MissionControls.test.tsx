import { render, screen } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';
import { MissionControls } from '../MissionControls';

vi.mock('../../map/FlightPlans', () => ({
  saveFlightPlan: vi.fn(),
}));

const drawRef = { current: { getSelected: vi.fn() } };
const onGetFlightPlans = vi.fn();

describe('MissionControls — planning tab', () => {
  it('renders the Save Mission button', () => {
    render(
      <MissionControls
        activeTab="planning"
        drawRef={drawRef as any}
        onGetFlightPlans={onGetFlightPlans}
      />
    );
    expect(screen.getByRole('button', { name: 'Save Mission' })).toBeInTheDocument();
  });

  it('does not render flight plan buttons', () => {
    render(
      <MissionControls
        activeTab="planning"
        drawRef={drawRef as any}
        onGetFlightPlans={onGetFlightPlans}
      />
    );
    expect(screen.queryByRole('button', { name: 'Get Flight Plans' })).not.toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Set Active' })).not.toBeInTheDocument();
  });
});

describe('MissionControls — flights tab', () => {
  it('renders Get Flight Plans button', () => {
    render(
      <MissionControls
        activeTab="flights"
        drawRef={drawRef as any}
        onGetFlightPlans={onGetFlightPlans}
      />
    );
    expect(screen.getByRole('button', { name: 'Get Flight Plans' })).toBeInTheDocument();
  });

  it('renders Set Active button', () => {
    render(
      <MissionControls
        activeTab="flights"
        drawRef={drawRef as any}
        onGetFlightPlans={onGetFlightPlans}
      />
    );
    expect(screen.getByRole('button', { name: 'Set Active' })).toBeInTheDocument();
  });

  it('does not render Save Mission button', () => {
    render(
      <MissionControls
        activeTab="flights"
        drawRef={drawRef as any}
        onGetFlightPlans={onGetFlightPlans}
      />
    );
    expect(screen.queryByRole('button', { name: 'Save Mission' })).not.toBeInTheDocument();
  });
});

describe('MissionControls — sensor tab', () => {
  it('renders nothing', () => {
    const { container } = render(
      <MissionControls
        activeTab="sensor"
        drawRef={drawRef as any}
        onGetFlightPlans={onGetFlightPlans}
      />
    );
    expect(container).toBeEmptyDOMElement();
  });
});
