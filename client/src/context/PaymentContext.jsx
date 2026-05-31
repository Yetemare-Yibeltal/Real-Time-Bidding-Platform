import React, { createContext, useContext, useState } from 'react'
import api from '../api/axios'
import PaymentModal from '../components/PaymentModal'

const PaymentContext = createContext(null)

export const PaymentProvider = ({ children }) => {
  const [modal, setModal] = useState({
    open: false,
    fee: 0,
    itemId: null,
    purpose: 'bid_access',
    pending: false,
    error: null
  })

  const openPayment = (fee, itemId = null, purpose = 'bid_access') => {
    setModal({ open: true, fee, itemId, purpose, pending: false, error: null })
  }

  const closePayment = () =>
    setModal(prev => ({ ...prev, open: false, error: null }))

  const startCheckout = async (opts = {}) => {
    const fee = Number(opts.fee ?? modal.fee)
    const purpose = opts.purpose ?? modal.purpose
    const itemId = modal.itemId ?? opts.itemId ?? null

    if (!localStorage.getItem('token')) {
      window.location.href = `/login?next=${encodeURIComponent(
        window.location.pathname
      )}`
      return
    }

    try {
      setModal(prev => ({ ...prev, pending: true, error: null }))

      const res = await api.post('/billing/create-session', {
        amount: fee,
        currency: 'usd',
        description: 'Bid access fee',
        purpose,
        itemId
      })

      if (res.data?.url) {
        if (itemId)
          localStorage.setItem(
            'pendingBid',
            JSON.stringify({ itemId, amount: fee })
          )
        window.location.href = res.data.url
      } else {
        throw new Error('Invalid payment gateway response')
      }
    } catch (err) {
      const msg = err?.response?.data?.error || 'Payment initialization failed'
      setModal(prev => ({ ...prev, pending: false, error: msg }))
    }
  }

  return (
    <PaymentContext.Provider
      value={{ openPayment, closePayment, startCheckout }}
    >
      {children}
      <PaymentModal
        modal={modal}
        close={closePayment}
        startCheckout={startCheckout}
      />
    </PaymentContext.Provider>
  )
}

export const usePayment = () => useContext(PaymentContext)
