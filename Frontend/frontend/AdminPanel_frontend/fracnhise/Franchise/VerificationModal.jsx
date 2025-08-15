import React from 'react';
import { format } from 'date-fns';

// Helper to display data safely
const displayValue = (value, isDate = false) => {
    if (value === null || value === undefined || value === '') return <span className="text-gray-500 italic">N/A</span>;
    if (isDate) {
        try {
            return format(new Date(value), 'PP'); // Format as Oct 17, 2023
        } catch {
            return <span className="text-red-500 italic">Invalid Date</span>;
        }
    }
    return String(value);
};

const DetailItem = ({ label, value, isDate = false }) => (
    <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
        <dt className="text-sm font-medium text-gray-600">{label}</dt>
        <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">{displayValue(value, isDate)}</dd>
    </div>
);

const VerificationModal = ({ franchise, isOpen, onConfirm, onCancel, isVerifying }) => {
    if (!isOpen || !franchise) return null;

    return (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-gray-600 bg-opacity-75 flex items-center justify-center p-4">
            <div className="relative bg-white rounded-lg shadow-xl max-w-2xl w-full mx-auto">
                {/* Modal Header */}
                <div className="flex justify-between items-center p-4 border-b">
                    <h3 className="text-lg font-semibold text-gray-900">Verify Franchise Details</h3>
                    <button
                        onClick={onCancel}
                        className="text-gray-400 bg-transparent hover:bg-gray-200 hover:text-gray-900 rounded-lg text-sm p-1.5 ml-auto inline-flex items-center"
                        disabled={isVerifying}
                    >
                        <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd"></path></svg>
                    </button>
                </div>

                {/* Modal Body */}
                <div className="p-6 space-y-4 max-h-[60vh] overflow-y-auto">
                    <dl className="divide-y divide-gray-200">
                        <DetailItem label="Franchise Name" value={franchise.franchiseName} />
                        <DetailItem label="Owner Name" value={franchise.ownerName} />
                        <DetailItem label="Designation" value={franchise.designation} />
                        <DetailItem label="Date of Birth" value={franchise.dob} isDate={true} />
                        <DetailItem label="Email" value={franchise.email} />
                        <DetailItem label="Mobile" value={franchise.mobile} />
                        <DetailItem label="Address" value={franchise.address} />
                        <DetailItem label="City" value={franchise.city} />
                        <DetailItem label="State" value={franchise.state} />
                        <DetailItem label="Postal Code" value={franchise.postalCode} />
                        <DetailItem label="Country" value={franchise.country} />
                        <DetailItem label="Plan Validity" value={`${franchise.planValidityDays} days`} />
                        <DetailItem label="GST Number" value={franchise.gstNumber} />
                        <DetailItem label="ATC Code" value={franchise.atcCode} />
                        <DetailItem label="No. of Computers" value={franchise.totalComputers} />
                        <DetailItem label="No. of Students" value={franchise.totalStudents} />
                        <DetailItem label="Request Date" value={franchise.requestDate} isDate={true} />
                        <DetailItem label="Current Status" value={franchise.status} />
                        <DetailItem label="Current Verification" value={franchise.verificationStatus} />
                        {/* Add image previews if needed */}
                        {franchise.franchiseLogoUrl && (
                             <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-600">Franchise Logo</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <img src={franchise.franchiseLogoUrl} alt="Franchise Logo" className="h-20 w-auto object-contain rounded border" />
                                </dd>
                            </div>
                        )}
                         {franchise.franchiseSignatureUrl && (
                             <div className="py-2 sm:grid sm:grid-cols-3 sm:gap-4">
                                <dt className="text-sm font-medium text-gray-600">Signature</dt>
                                <dd className="mt-1 text-sm text-gray-900 sm:mt-0 sm:col-span-2">
                                    <img src={franchise.franchiseSignatureUrl} alt="Signature" className="h-20 w-auto object-contain rounded border" />
                                </dd>
                            </div>
                        )}
                    </dl>
                </div>

                {/* Modal Footer */}
                <div className="flex items-center justify-end p-4 border-t space-x-2">
                    <button
                        onClick={onCancel}
                        type="button"
                        className="text-gray-500 bg-white hover:bg-gray-100 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg border border-gray-200 text-sm font-medium px-5 py-2.5 hover:text-gray-900 focus:z-10 disabled:opacity-50"
                        disabled={isVerifying}
                    >
                        Cancel
                    </button>
                    <button
                        onClick={onConfirm}
                        type="button"
                        className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center disabled:opacity-50"
                        disabled={isVerifying}
                    >
                        {isVerifying ? 'Verifying...' : 'Confirm Verification'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default VerificationModal;
