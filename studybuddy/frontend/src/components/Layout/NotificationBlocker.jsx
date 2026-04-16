import { useEffect, useState } from 'react';

function NotificationBlocker() {
  const [permission, setPermission] = useState('default');
  const [blocked, setBlocked] = useState(false);
  const [statusMessage, setStatusMessage] = useState('Notifications are ready, but currently silent.');

  useEffect(() => {
    if (!('Notification' in window)) {
      setStatusMessage('Browser notifications are not supported in this environment.');
      return;
    }
    setPermission(Notification.permission);
  }, []);

  useEffect(() => {
    if (permission === 'denied') {
      setBlocked(true);
      setStatusMessage('Notification permission denied. Blocker is active.');
    } else if (blocked) {
      setStatusMessage('Notifications are blocked inside the app.');
    } else {
      setStatusMessage('Notifications are active and ready.');
    }
  }, [permission, blocked]);

  const requestPermission = async () => {
    if (!('Notification' in window)) return;

    const result = await Notification.requestPermission();
    setPermission(result);
    if (result === 'granted' && !blocked) {
      new Notification('StudyBuddy is ready', {
        body: 'Notifications are enabled. You can toggle blocking anytime.',
        icon: '/favicon.svg'
      });
    }
  };

  const toggleBlocker = () => {
    setBlocked((current) => !current);
  };

  return (
    <section className="mb-8 rounded-[28px] border border-[#00ff9d]/10 bg-[#07100f]/95 p-5 shadow-[0_0_40px_rgba(0,255,157,0.14)]">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.35em] text-[#00ff9d]">Notification Blocker</p>
          <h3 className="mt-2 text-2xl font-semibold text-white">Control alerts in StudyBuddy</h3>
          <p className="mt-2 max-w-2xl text-sm text-white/70">Toggle notification blocking, request browser permission, and keep your study flow uninterrupted.</p>
        </div>
        <div className="flex flex-col gap-3 rounded-3xl border border-white/10 bg-[#081114] p-4 text-right">
          <p className="text-xs uppercase tracking-[0.3em] text-white/50">Status</p>
          <p className="text-sm font-semibold text-white">{permission === 'default' ? 'Permission not requested' : permission === 'granted' ? 'Allowed' : 'Denied'}</p>
          <p className="text-sm text-white/60">{blocked ? 'Blocked by app' : 'Allowed by app'}</p>
        </div>
      </div>

      <div className="mt-6 flex flex-col gap-3 sm:flex-row sm:items-center">
        <button onClick={requestPermission} className="inline-flex items-center justify-center rounded-2xl bg-[#00ff9d] px-5 py-3 text-sm font-semibold text-black transition hover:bg-[#8cffb8]">
          Request Permission
        </button>
        <button onClick={toggleBlocker} className={`inline-flex items-center justify-center rounded-2xl px-5 py-3 text-sm font-semibold transition ${blocked ? 'bg-rose-500 text-white hover:bg-rose-400' : 'bg-[#111a15] text-white hover:bg-white/10'}`}>
          {blocked ? 'Unblock Notifications' : 'Block Notifications'}
        </button>
      </div>

      <div className="mt-4 rounded-3xl border border-white/10 bg-[#091516] p-4 text-sm text-white/70">
        {statusMessage}
      </div>
    </section>
  );
}

export default NotificationBlocker;
