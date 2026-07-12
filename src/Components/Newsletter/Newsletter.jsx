import React, { useEffect, useRef, useState } from 'react';
import Modal from '../Modal/Modal';
import { Upload, TrendingUp, TrendingDown, Mail, ChevronLeft, ChevronRight } from 'lucide-react';
import './Newsletter.css';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  useNewsletterSubscriptions,
  fetchAllNewsletterSubscribers,
} from '../../hooks/queries/useNewsletter';
import { useAnimateValue } from '../../hooks/useAnimateValue';

const Newsletter = () => {
  const [percentageChange, setPercentageChange] = useState(0);
  const [trend, setTrend] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 12;

  const [modalInfo, setModalInfo] = useState({
    show: false,
    title: '',
    message: '',
    subMessage: '',
    type: '',
  });
  const hoverTimeoutRef = useRef(null);

  const { data, isLoading } = useNewsletterSubscriptions(currentPage, itemsPerPage);
  const paginatedList = data?.subscriptions ?? [];
  const subscriptions = data?.total ?? 0;
  const totalPages = Math.max(1, Math.ceil(subscriptions / itemsPerPage));
  const displayedPercentage = useAnimateValue(percentageChange);

  useEffect(() => {
    return () => {
      if (hoverTimeoutRef.current) clearTimeout(hoverTimeoutRef.current);
    };
  }, []);

  useEffect(() => {
    if (!data) return;

    const today = new Date().toDateString();
    const lastUpdate = localStorage.getItem('newsletterLastUpdate');
    const oldCount = Number(localStorage.getItem('prevSubscriptions')) || 0;

    if (oldCount > 0) {
      const diff = subscriptions - oldCount;
      const percent = Number(((diff / oldCount) * 100).toFixed(1));
      setPercentageChange(percent);
      setTrend(diff > 0 ? 'up' : diff < 0 ? 'down' : 'flat');
    } else if (oldCount === 0 && subscriptions > 0) {
      setPercentageChange(100);
      setTrend('up');
    }

    if (lastUpdate !== today) {
      localStorage.setItem('prevSubscriptions', subscriptions);
      localStorage.setItem('newsletterLastUpdate', today);
    }
  }, [data, subscriptions]);

  const exportSubscribersToExcel = async () => {
    try {
      const exportData = await fetchAllNewsletterSubscribers();

      if (exportData.length === 0) {
        setModalInfo({
          show: true,
          title: 'No Data',
          message: 'There are no subscribers to export.',
          subMessage: '',
          type: 'info',
        });
        return;
      }

      const worksheet = XLSX.utils.json_to_sheet(exportData);
      const workbook = XLSX.utils.book_new();
      XLSX.utils.book_append_sheet(workbook, worksheet, 'Subscribers');
      const excelBuffer = XLSX.write(workbook, { bookType: 'xlsx', type: 'array' });
      const file = new Blob([excelBuffer], { type: 'application/octet-stream' });
      saveAs(file, 'newsletter_subscribers.xlsx');
    } catch (error) {
      console.error('Error exporting subscribers', error);
      setModalInfo({
        show: true,
        title: 'Error!',
        message: 'Failed to export subscribers.',
        type: 'error',
      });
    }
  };

  if (isLoading) {
    return <p style={{ color: '#ccc', padding: '2rem' }}>Loading subscriptions...</p>;
  }

  return (
    <div className='subscription-container'>
      <div className="subscription-cards">
        <div className="subscription-card">
          <h3>Newsletter Subscribers <Mail size={16} /></h3>
          <p>{subscriptions}</p>
          <div className="subscription-data">
            {trend ? (
              <div className={`trend ${trend}`}>
                {trend === 'up' ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
                <span>{displayedPercentage}%</span>
              </div>
            ) : (
              <div className="trend flat"><span>0%</span></div>
            )}
            <p style={{ fontSize: '14px', color: 'rgba(255, 255, 255, 0.7)', marginTop: '24px' }}>
              from yesterday
            </p>
          </div>
        </div>
        <div className="export-card">
          <button className="button" onClick={exportSubscribersToExcel}>
            <Upload size={16} /> Export Emails
          </button>
        </div>
      </div>

      <div className="newsletter-list">
        <h3 style={{ marginBottom: '12px', marginLeft: '4vw', color: '#fff', marginTop: '72px' }}>
          List of Subscribers: {subscriptions}
        </h3>

        <div className="notification-list">
          {paginatedList.length > 0 ? (
            paginatedList.map((sub, index) => (
              <div key={sub.id ?? sub.email ?? index}>
                <div>
                  <p style={{ fontWeight: 500 }}>{sub.email}</p>
                  <hr className="notification-hr" />
                </div>
              </div>
            ))
          ) : (
            <p style={{ opacity: 0.6 }}>No subscribers found yet.</p>
          )}
        </div>

        {subscriptions > itemsPerPage && (
          <div className="pagination-controls" style={{
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            gap: '12px',
            marginTop: '24px'
          }}>
            <button
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={currentPage === 1}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronLeft size={16} />
            </button>
            <span style={{ color: '#ccc' }}>
              Page {currentPage} of {totalPages}
            </span>
            <button
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                background: 'transparent',
                color: '#fff',
                border: '1px solid rgba(255,255,255,0.3)',
                borderRadius: '6px',
                padding: '6px 10px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
              }}
            >
              <ChevronRight size={16} />
            </button>
          </div>
        )}
      </div>

      {modalInfo.show && (
        <Modal
          show={modalInfo.show}
          title={modalInfo.title}
          message={modalInfo.message}
          subMessage={modalInfo.subMessage}
          type={modalInfo.type}
          onClose={() => setModalInfo({ ...modalInfo, show: false })}
        />
      )}
    </div>
  );
};

export default Newsletter;
