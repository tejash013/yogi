import { useState } from 'react';
import { FiMail, FiShield, FiHelpCircle, FiCopy, FiCheck } from 'react-icons/fi';
import { APP_CONFIG } from '@/constants';
import { Modal, Button } from '@/components/ui';

export default function Footer() {
  const [activeModal, setActiveModal] = useState<'privacy' | 'support' | null>(null);
  const [copied, setCopied] = useState(false);

  const contactEmail = APP_CONFIG.CONTACT_EMAIL || 'tsubasadigitals@gmail.com';

  const copyEmail = () => {
    navigator.clipboard.writeText(contactEmail);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <footer className="border-t border-neutral-200 bg-white py-6 dark:border-neutral-700 dark:bg-neutral-900">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
          <p className="text-sm text-neutral-500 dark:text-neutral-400 text-center md:text-left">
            &copy; {new Date().getFullYear()} <span className="font-semibold text-neutral-800 dark:text-neutral-200">{APP_CONFIG.APP_NAME}</span> by <span className="font-medium text-primary-600 dark:text-primary-400">tsubasa digital</span>. All rights reserved.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-6 text-sm">
            <button
              type="button"
              onClick={() => setActiveModal('privacy')}
              className="text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white cursor-pointer font-medium"
            >
              Privacy Policy
            </button>

            <button
              type="button"
              onClick={() => setActiveModal('support')}
              className="text-neutral-500 transition-colors hover:text-neutral-800 dark:text-neutral-400 dark:hover:text-white cursor-pointer font-medium"
            >
              Support
            </button>
          </div>
        </div>
      </div>

      {/* Privacy Policy Modal */}
      <Modal
        isOpen={activeModal === 'privacy'}
        onClose={() => setActiveModal(null)}
        title="Privacy Policy"
        size="lg"
      >
        <div className="max-h-[70vh] space-y-4 overflow-y-auto pr-1 text-sm text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            <FiShield className="h-4 w-4" />
            <span>QuickTable by tsubasa digital</span>
          </div>

          <p>
            Welcome to <strong>QuickTable</strong>, developed and powered by <strong>tsubasa digital</strong>. We value your privacy and are committed to protecting personal and operational information collected across online menus, kitchen KDS operations, POS billing, and administrative dashboards.
          </p>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white">1. Information We Collect</h4>
            <p className="mt-1 text-neutral-600 dark:text-neutral-300">
              We collect profile details (name, email address, phone number) when you register or sign in, alongside ordering records (selected menu items, table QR identifiers, invoices, and special preparation instructions) required to complete dining service.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white">2. How Information is Used</h4>
            <p className="mt-1 text-neutral-600 dark:text-neutral-300">
              Your data is strictly used to synchronize orders in real time between customers, kitchen display screens, and cashiers, generate accurate tax invoices, and offer customer support. We do not sell or rent personal information to any third parties.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white">3. Data Security & Multi-Tenant Isolation</h4>
            <p className="mt-1 text-neutral-600 dark:text-neutral-300">
              QuickTable enforces multi-tenant data boundaries, secure HTTP-only cookies, JSON Web Token (JWT) session security, and encrypted database connections so that restaurant records and customer data remain strictly isolated.
            </p>
          </div>

          <div>
            <h4 className="font-semibold text-neutral-900 dark:text-white">4. Contact & Inquiries</h4>
            <p className="mt-1 text-neutral-600 dark:text-neutral-300">
              For any questions regarding this Privacy Policy, your rights, or data requests, please contact our team directly at:{' '}
              <a href={`mailto:${contactEmail}`} className="font-semibold text-primary-600 underline dark:text-primary-400">
                {contactEmail}
              </a>.
            </p>
          </div>

          <div className="flex justify-end pt-2">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
              Close
            </Button>
          </div>
        </div>
      </Modal>

      {/* Support Modal */}
      <Modal
        isOpen={activeModal === 'support'}
        onClose={() => setActiveModal(null)}
        title="QuickTable Support"
        size="md"
      >
        <div className="space-y-4 text-sm text-neutral-600 dark:text-neutral-300">
          <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-primary-600 dark:text-primary-400">
            <FiHelpCircle className="h-4 w-4" />
            <span>Help & Operational Support</span>
          </div>

          <p>
            Need assistance managing your restaurant menu, configuring tables & QR codes, connecting POS thermal printers, or resolving active orders? The <strong>tsubasa digital</strong> technical team is ready to help.
          </p>

          <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-3.5 dark:border-neutral-700 dark:bg-neutral-800">
            <p className="text-xs font-semibold uppercase tracking-wider text-neutral-500">Official Support & Contact Email</p>
            <div className="mt-1.5 flex items-center justify-between">
              <span className="font-mono text-sm font-bold text-neutral-900 dark:text-white">
                {contactEmail}
              </span>
              <button
                type="button"
                onClick={copyEmail}
                className="inline-flex items-center gap-1 text-xs font-medium text-primary-600 hover:underline dark:text-primary-400 cursor-pointer"
              >
                {copied ? <FiCheck className="h-3.5 w-3.5 text-emerald-500" /> : <FiCopy className="h-3.5 w-3.5" />}
                <span>{copied ? 'Copied!' : 'Copy'}</span>
              </button>
            </div>
          </div>

          <div className="space-y-1.5 rounded-lg bg-neutral-100/60 p-3 text-xs text-neutral-600 dark:bg-neutral-800/60 dark:text-neutral-400">
            <p>• <strong>Support Hours:</strong> Monday – Saturday, 9:00 AM – 8:00 PM IST</p>
            <p>• <strong>Emergency Outages:</strong> Monitored 24/7</p>
            <p>• <strong>Response Time:</strong> Average reply within 2–4 business hours</p>
          </div>

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" size="sm" onClick={() => setActiveModal(null)}>
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={() => {
                window.location.href = `mailto:${contactEmail}?subject=QuickTable%20Support%20Request`;
              }}
            >
              <FiMail className="mr-1.5 h-3.5 w-3.5" />
              Email Support
            </Button>
          </div>
        </div>
      </Modal>
    </footer>
  );
}
