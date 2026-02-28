export default function FilterBar({
    departments,
    filters,
    onChange,
}) {
    const semesters = [1, 2, 3, 4, 5, 6, 7, 8];
    const years = ['2024-2025', '2023-2024', '2022-2023', '2021-2022', '2020-2021'];

    const handleChange = (key, value) => {
        onChange({ ...filters, [key]: value });
    };

    return (
        <div className="flex flex-wrap items-center gap-3 py-4">
            <span className="text-sm font-medium text-text-muted mr-1">
                <span className="material-symbols-outlined text-base align-middle mr-1">filter_list</span>
                Filter by:
            </span>

            {/* Department */}
            <select
                value={filters.department_id || ''}
                onChange={(e) => handleChange('department_id', e.target.value)}
                className="px-4 py-2 rounded-xl border border-border-main bg-bg-surface text-sm text-text-main
          focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all appearance-none pr-10 relative"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
                <option value="">All Branches</option>
                {departments.map((d) => (
                    <option key={d.id} value={d.id}>
                        {d.code} — {d.name}
                    </option>
                ))}
            </select>

            {/* Semester */}
            <select
                value={filters.semester || ''}
                onChange={(e) => handleChange('semester', e.target.value)}
                className="px-4 py-2 rounded-xl border border-border-main bg-bg-surface text-sm text-text-main
          focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all appearance-none pr-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
                <option value="">All Semesters</option>
                {semesters.map((s) => (
                    <option key={s} value={s}>Semester {s}</option>
                ))}
            </select>

            {/* Year */}
            <select
                value={filters.year || ''}
                onChange={(e) => handleChange('year', e.target.value)}
                className="px-4 py-2 rounded-xl border border-border-main bg-bg-surface text-sm text-text-main
          focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all appearance-none pr-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
                <option value="">All Years</option>
                {years.map((y) => (
                    <option key={y} value={y}>{y}</option>
                ))}
            </select>

            {/* Exam Type */}
            <select
                value={filters.exam_type || ''}
                onChange={(e) => handleChange('exam_type', e.target.value)}
                className="px-4 py-2 rounded-xl border border-border-main bg-bg-surface text-sm text-text-main
          focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all appearance-none pr-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
                <option value="">All Exams</option>
                <option value="Mid 1">Mid 1</option>
                <option value="Mid 2">Mid 2</option>
                <option value="End Semester">End Semester</option>
            </select>

            {/* Sort */}
            <select
                value={filters.sort || 'newest'}
                onChange={(e) => handleChange('sort', e.target.value)}
                className="px-4 py-2 rounded-xl border border-border-main bg-bg-surface text-sm text-text-main
          focus:outline-none focus:ring-2 focus:ring-primary/10 focus:border-primary/40 transition-all ml-auto appearance-none pr-10"
                style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' fill='none' viewBox='0 0 24 24' stroke='%2394a3b8'%3E%3Cpath stroke-linecap='round' stroke-linejoin='round' stroke-width='2' d='M19 9l-7 7-7-7'%3E%3C/path%3E%3C/svg%3E")`, backgroundRepeat: 'no-repeat', backgroundPosition: 'right 0.75rem center', backgroundSize: '1rem' }}
            >
                <option value="newest">Newest First</option>
                <option value="oldest">Oldest First</option>
                <option value="downloads">Most Downloads</option>
                <option value="rating">Highest Rated</option>
            </select>
        </div>
    );
}
