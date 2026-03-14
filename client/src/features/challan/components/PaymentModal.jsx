import React from "react";
import { DestructiveButton } from "../../../components/ui/DestructiveButton";
import { FlowButton } from "../../../components/ui/FlowButton";

const PaymentModal = ({
    isOpen,
    challan,
    onClose,
    onSubmit
}) => {
    if (!isOpen || !challan) return null;

    return (
        <div className="payment-modal-overlay" style={modalOverlayStyle}>
            <div className="payment-modal" style={modalStyle}>
                <h2>RedLight Secure Checkout</h2>
                <p>Paying Challan: <b>{challan.challan_id}</b></p>
                <h3 style={{ color: '#FF7043' }}>Amount: &#8377;{challan.fine_amount}</h3>

                <form onSubmit={onSubmit} style={{ marginTop: '20px', display: 'flex', flexDirection: 'column', gap: '15px' }}>
                    <div>
                        <label className="input-label">Card Number</label>
                        <input required className="text-input" type="text" placeholder="XXXX-XXXX-XXXX-XXXX" maxLength="19" />
                    </div>
                    <div style={{ display: 'flex', gap: '15px' }}>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">Expiry Date</label>
                            <input required className="text-input" type="text" placeholder="MM/YY" maxLength="5" />
                        </div>
                        <div style={{ flex: 1 }}>
                            <label className="input-label">CVV</label>
                            <input required className="text-input" type="password" placeholder="***" maxLength="3" />
                        </div>
                    </div>
                    <div>
                        <label className="input-label">Cardholder Name</label>
                        <input required className="text-input" type="text" placeholder="Name on card" />
                    </div>

                    <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                        <div style={{ flex: 1, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                            <DestructiveButton onClick={onClose}>Cancel</DestructiveButton>
                        </div>
                        <FlowButton text="Confirm Payment" type="submit" variant="orange" className="flex-[2]" />
                    </div>
                </form>
            </div>
        </div>
    );
};

const modalOverlayStyle = {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0,0,0,0.6)',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    zIndex: 1000
};

const modalStyle = {
    background: 'white',
    padding: '30px',
    borderRadius: '12px',
    width: '100%',
    maxWidth: '400px',
    boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
};

export default PaymentModal;
