//src/pages/DyanmicResturantHomePage.jsx:1

import React, { useState, useEffect, useMemo } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { restaurants } from '../data/restaurants';
import { isRestaurantOpen } from '../utils/timeUtils'; // Your util
import { calculateDistance } from '../utils/distance'; // Your util
import SpecificMap from '../components/SpecificMap'; // Your map component
// import OfflineMapWrapper from '../components/OfflineMapWrapper'; // Your offline guard

// Icons (Using feather icons or similar standard SVG)
import {
    Phone, MessageCircle, MapPin, Clock,
    Star, ShoppingBag, Info, MessageSquare,
    ChevronLeft, Share2, Globe, Facebook, Instagram, Youtube, Music, Music2
} from 'lucide-react';

import './DynamicRestaurant.css';

const DynamicRestaurantHomePage = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    // State
    const [activeTab, setActiveTab] = useState('order'); // 'order', 'contact', 'reviews'
    const [currentImageIndex, setCurrentImageIndex] = useState(0);
    const [userLocation, setUserLocation] = useState(null);
    const [distance, setDistance] = useState(null);
    const [menuPage, setMenuPage] = useState(0);


    const restaurant = restaurants.find((r) => r.id === Number(id));

    // 1. Image Slideshow Logic
    useEffect(() => {
        if (!restaurant?.images || restaurant.images.length <= 1) return;

        const interval = setInterval(() => {
            setCurrentImageIndex((prev) => (prev + 1) % restaurant.images.length);
        }, 4000); // Change every 4 seconds

        return () => clearInterval(interval);
    }, [restaurant]);

    // 2. User Location Logic
    useEffect(() => {
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition((pos) => {
                const loc = { lat: pos.coords.latitude, lng: pos.coords.longitude };
                setUserLocation(loc);
            });
        }
    }, []);

    // 3. Calculate Distance
    useEffect(() => {
        if (userLocation && restaurant) {
            setDistance(calculateDistance(userLocation, restaurant));
        }
    }, [userLocation, restaurant]);

    if (!restaurant) return <div>Restaurant not found</div>;

    // 4. Dynamic Rating Calculation
    const averageRating = useMemo(() => {
        if (!restaurant.reviews || restaurant.reviews.length === 0) return 0;
        const total = restaurant.reviews.reduce((acc, curr) => acc + curr.rating, 0);
        return (total / restaurant.reviews.length).toFixed(1);
    }, [restaurant.reviews]);

    const isOpen = isRestaurantOpen(restaurant);

    // --- Action Handlers ---
    const handleCall = () => {
        if (restaurant.phone) window.location.href = `tel:${restaurant.phone}`;
    };

    const handleWhatsApp = () => {
        if (restaurant.whatsapp) {
            const message = `Hello, I'd like to make an inquiry about ${restaurant.name}`;
            window.open(`https://wa.me/${restaurant.whatsapp}?text=${encodeURIComponent(message)}`, '_blank');
        }
    };


    // --- Helper to chunk menu items into groups of 4 ---
    const menuChunks = useMemo(() => {
        if (!restaurant.menu) return [];
        const chunkSize = 4;
        const chunks = [];
        for (let i = 0; i < restaurant.menu.length; i += chunkSize) {
            chunks.push(restaurant.menu.slice(i, i + chunkSize));
        }
        return chunks;
    }, [restaurant.menu]);



    // --- Render Functions ---

    const renderHeader = () => (
        <div className="dr-header">
            <div className="dr-image-slider">
                {restaurant.images.map((img, idx) => (
                    <img
                        key={idx}
                        src={img}
                        alt={restaurant.name}
                        className={`dr-slide-img ${idx === currentImageIndex ? 'active' : ''}`}
                    />
                ))}
                <div className="dr-overlay-gradient"></div>
            </div>

            {/* Top Bar */}
            <div className="dr-top-bar">
                <button onClick={() => navigate(-1)} className="dr-icon-btn"><ChevronLeft size={24} /></button>
                {/*<button className="dr-icon-btn"><Share2 size={20} /></button>*/}
            </div>

            {/* Status Badge */}
            <div className={`dr-status-badge ${isOpen ? 'open' : 'closed'}`}>
                {isOpen ? 'Open Now' : 'Closed'}
            </div>

            {/* Restaurant Name Centered */}
            <div className="dr-header-content">
                <h1>{restaurant.name}</h1>
                <p>{restaurant.cuisine} • {restaurant.address}</p>
            </div>
        </div>
    );

    const renderNavigation = () => (
        <div className="dr-nav-container">
            <div
                className={`dr-nav-item ${activeTab === 'order' ? 'active' : ''}`}
                onClick={() => setActiveTab('order')}
            >
                <div className="dr-nav-icon"><ShoppingBag size={20} /></div>
                <span>Order</span>
            </div>
            <div
                className={`dr-nav-item ${activeTab === 'contact' ? 'active' : ''}`}
                onClick={() => setActiveTab('contact')}
            >
                <div className="dr-nav-icon"><Info size={20} /></div>
                <span>Contact</span>
            </div>
            <div
                className={`dr-nav-item ${activeTab === 'reviews' ? 'active' : ''}`}
                onClick={() => setActiveTab('reviews')}
            >
                <div className="dr-nav-icon"><MessageSquare size={20} /></div>
                <span>Reviews</span>
            </div>
        </div>
    );

    const renderOrderSection = () => (
        <div className="dr-section order-section">
            <div className="section-header-row">
                <h3>Menu</h3>
                <span className="page-indicator">
                    Page {menuPage + 1} of {Math.max(1, menuChunks.length)}
                </span>
            </div>

            {/* The Slider Window */}
            <div className="dr-menu-slider-window">
                {/* The Moving Track */}
                <div
                    className="dr-menu-track"
                    style={{ transform: `translateX(-${menuPage * 100}%)` }}
                >
                    {menuChunks.length > 0 ? (
                        menuChunks.map((chunk, pageIndex) => (
                            <div key={pageIndex} className="dr-menu-page">
                                {/* 2x2 Grid for the group of 4 */}
                                <div className="dr-menu-grid">
                                    {chunk.map((item, itemIndex) => (
                                        <div key={itemIndex} className="dr-menu-card-compact">
                                            <div className="dr-compact-img">
                                                {item.image ? (
                                                    <img src={item.image} alt={item.name} />
                                                ) : (
                                                    <div className="placeholder">🍽️</div>
                                                )}
                                            </div>
                                            <div className="dr-compact-info">
                                                <h4>{item.name}</h4>
                                                <span className="dr-price">
                                                    {item.price ? `${item.price.toLocaleString()}` : 'Price on request'}
                                                </span>
                                            </div>
                                            <button className="dr-add-btn">+</button>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="dr-menu-page">
                            <p className="no-data">Menu items not available.</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Pagination Dots */}
            {menuChunks.length > 1 && (
                <div className="dr-pagination-dots">
                    {menuChunks.map((_, idx) => (
                        <button
                            key={idx}
                            className={`dr-dot ${menuPage === idx ? 'active' : ''}`}
                            onClick={() => setMenuPage(idx)}
                        />
                    ))}
                </div>
            )}

            {/* Bottom Actions */}
            <div className="dr-bottom-actions">
                <button className="dr-action-btn whatsapp" onClick={handleWhatsApp}>
                    <MessageCircle size={20} />
                    <span>Message</span>
                </button>
                <button className="dr-action-btn call" onClick={handleCall}>
                    <Phone size={20} />
                    <span>Call Now</span>
                </button>
            </div>
        </div>
    );

    const renderContactSection = () => (
        <div className="dr-section contact-section">
            {/* Key Metrics */}
            <div className="dr-metrics-grid">
                <div className="dr-metric">
                    <MapPin size={18} className="icon-blue" />
                    <span className="label">Distance</span>
                    <strong>{distance ? `${distance} km` : '...'}</strong>
                </div>
                <div className="dr-metric">
                    <Clock size={18} className="icon-orange" />
                    <span className="label">Open Time</span>
                    <strong>{restaurant.openHours?.monday?.[0] || 'N/A'}</strong>
                </div>
                <div className="dr-metric">
                    <ShoppingBag size={18} className="icon-green" />
                    <span className="label">Delivery</span>
                    <strong>{restaurant.deliveryTime || '30 min'}</strong>
                </div>
            </div>

            {/* Socials */}
            <div className="dr-card">
                <h3>Connect</h3>
                <div className="dr-social-list">
                    {restaurant.phone && (
                        <a href={`tel:${restaurant.phone}`} className="dr-social-row">
                            <span className="social-icon phone"><Phone size={16}/></span>
                            <span>{restaurant.phone}</span>
                        </a>
                    )}
                    {restaurant.socials?.facebook && (
                        <a target={'_blank'} href={`https://instagram.com/${restaurant.socials.facebook}`} >
                            <div className="dr-social-row">
                                <span className="social-icon fb"><Facebook size={16}/></span>
                                <span>{restaurant.socials.facebook}</span>
                            </div>
                        </a>
                    )}
                    {restaurant.socials?.instagram && (
                        <a target={'_blank'} href={`https://instagram.com/${restaurant.socials.instagram}`} >
                            <div className="dr-social-row">
                                <span className="social-icon ig"><Instagram size={16}/></span>
                                <span>@{restaurant.socials.instagram}</span>
                            </div>
                        </a>
                    )}
                    {restaurant.socials?.tiktok && (

                        <a target={'_blank'} href={`https://tiktok.com/${restaurant.socials.tiktok}`} >
                            <div className="dr-social-row">
                                <span className="social-icon ig"><Music2 size={16}/></span>
                                <span>@{restaurant.socials.tiktok}</span>
                            </div>
                        </a>
                    )}
                </div>
            </div>

            {/* Map */}
            <div className="dr-card">
                <h3>Location</h3>
                <div className="dr-map-container">
                    {/*<OfflineMapWrapper>*/}
                        <SpecificMap restaurant={restaurant} />
                    {/*</OfflineMapWrapper>*/}
                </div>
                <p className="dr-address">{restaurant.address}</p>
            </div>
        </div>
    );

    const renderReviewsSection = () => (
        <div className="dr-section reviews-section">
            {/* Summary */}
            <div className="dr-review-summary">
                <div className="dr-big-rating">
                    <h1>{averageRating}</h1>
                    <div className="dr-stars">
                        {[1, 2, 3, 4, 5].map((star) => (
                            <Star
                                key={star}
                                size={16}
                                fill={star <= Math.round(averageRating) ? "#FFD700" : "#e0e0e0"}
                                color={star <= Math.round(averageRating) ? "#FFD700" : "#e0e0e0"}
                            />
                        ))}
                    </div>
                    <span>{restaurant.reviews.length} reviews</span>
                </div>
                <div className="dr-rating-bars">
                    {/* Visual placeholder for rating distribution bars */}
                    {[5,4,3,2,1].map(num => (
                        <div key={num} className="dr-bar-row">
                            <span>{num}</span>
                            <div className="dr-bar-track">
                                <div
                                    className="dr-bar-fill"
                                    style={{
                                        width: `${restaurant.reviews.filter(r => Math.round(r.rating) === num).length / restaurant.reviews.length * 100}%`
                                    }}
                                ></div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="dr-review-list">
                {restaurant.reviews.map((rev) => (
                    <div key={rev.id} className="dr-review-item">
                        <div className="dr-review-header">
                            <div className="dr-user-avatar">{rev.user.charAt(0)}</div>
                            <div className="dr-review-meta">
                                <strong>{rev.user}</strong>
                                <div className="dr-stars-small">
                                    {[...Array(5)].map((_, i) => (
                                        <Star key={i} size={12} fill={i < rev.rating ? "#FFD700" : "#ddd"} color="none" />
                                    ))}
                                </div>
                            </div>
                            <span className="dr-date">{rev.date}</span>
                        </div>
                        <p>{rev.comment}</p>
                    </div>
                ))}
            </div>

            <button className="dr-write-review-btn">Write a Review</button>
        </div>
    );

    return (
        <div className="dr-page">
            {renderHeader()}
            {renderNavigation()}

            <div className="dr-body">
                {activeTab === 'order' && renderOrderSection()}
                {activeTab === 'contact' && renderContactSection()}
                {activeTab === 'reviews' && renderReviewsSection()}
            </div>
        </div>
    );
}

export default DynamicRestaurantHomePage;