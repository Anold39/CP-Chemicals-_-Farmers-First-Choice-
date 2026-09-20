/* ==========================================================================
   testimonials-data.js (TIER 1)
   Farmer testimonials shown on farmer_login.html. Previously two hardcoded
   cards -- now editable from manage_testimonials.html, with no code changes
   needed. Persisted under localStorage key 'cp_testimonials'.

   A testimonial can optionally be linked to a real record in the Farmer
   Database (cp_farmers) via farmerId -- a genuine reference, not just a
   one-time copy: this testimonial's own name/location stay as they were
   at the time it was added, even if that farmer's record is later edited,
   matching how the rest of this site keeps a record's own snapshot rather
   than silently rewriting historical entries when the source data changes.
   farmerId is null for a manually-entered testimonial (e.g. someone quoted
   at an event who isn't a registered farmer).
   ========================================================================== */

const DEFAULT_TESTIMONIALS = [
    { id: 'seed-1', quote: "The CP Farmer discount saved me over $200 on my tobacco chemicals this season. The AI advisor is a game changer!", name: "Tafadzwa C.", location: "Mvurwi", rating: 5, order: 1, farmerId: null },
    { id: 'seed-2', quote: "Great support from the Agronomy team. Whenever I have a pest issue, they respond almost instantly with the right solution.", name: "Rumbidzai G.", location: "Mazowe", rating: 5, order: 2, farmerId: null }
];

function getTestimonials() {
    try {
        const stored = JSON.parse(localStorage.getItem('cp_testimonials'));
        if (stored && stored.length > 0) return stored.sort((a, b) => (a.order || 0) - (b.order || 0));
    } catch (e) { /* fall through to seeding */ }
    localStorage.setItem('cp_testimonials', JSON.stringify(DEFAULT_TESTIMONIALS));
    return DEFAULT_TESTIMONIALS.slice();
}

function saveTestimonials(list) {
    localStorage.setItem('cp_testimonials', JSON.stringify(list));
}

function addTestimonial(quote, name, location, rating, farmerId = null) {
    const list = getTestimonials();
    const nextOrder = list.length > 0 ? Math.max(...list.map(t => t.order || 0)) + 1 : 1;
    const testimonial = {
        id: 'T-' + Date.now().toString(36).toUpperCase(),
        quote, name, location, rating: parseInt(rating) || 5, order: nextOrder, farmerId
    };
    list.push(testimonial);
    saveTestimonials(list);
    return testimonial;
}

function updateTestimonial(id, fields) {
    const list = getTestimonials();
    const idx = list.findIndex(t => t.id === id);
    if (idx === -1) return;
    Object.assign(list[idx], fields);
    saveTestimonials(list);
}

function deleteTestimonial(id) {
    const list = getTestimonials().filter(t => t.id !== id);
    saveTestimonials(list);
}
