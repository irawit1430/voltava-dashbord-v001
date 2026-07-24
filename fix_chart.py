import re

with open("src/components/DashboardHome/EnergyLoadChart.tsx", "r") as f:
    content = f.read()

# Replace <div className="chart-filters"> with the updated div
content = content.replace(
    '<div className="chart-filters">',
    '<div className="chart-filters" role="group" aria-label="Asset filters">'
)

# Update buttons with aria-pressed
content = content.replace(
    '''<button
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
          >''',
    '''<button
            className={`filter-pill ${activeFilter === 'all' ? 'active' : ''}`}
            onClick={() => setActiveFilter('all')}
            aria-pressed={activeFilter === 'all'}
          >'''
)

content = content.replace(
    '''<button
            className={`filter-pill ${activeFilter === 'solar' ? 'active' : ''}`}
            onClick={() => setActiveFilter('solar')}
          >''',
    '''<button
            className={`filter-pill ${activeFilter === 'solar' ? 'active' : ''}`}
            onClick={() => setActiveFilter('solar')}
            aria-pressed={activeFilter === 'solar'}
          >'''
)

content = content.replace(
    '''<button
            className={`filter-pill ${activeFilter === 'load-grid' ? 'active' : ''}`}
            onClick={() => setActiveFilter('load-grid')}
          >''',
    '''<button
            className={`filter-pill ${activeFilter === 'load-grid' ? 'active' : ''}`}
            onClick={() => setActiveFilter('load-grid')}
            aria-pressed={activeFilter === 'load-grid'}
          >'''
)

content = content.replace(
    '''<button
            className={`filter-pill ${activeFilter === 'battery' ? 'active' : ''}`}
            onClick={() => setActiveFilter('battery')}
          >''',
    '''<button
            className={`filter-pill ${activeFilter === 'battery' ? 'active' : ''}`}
            onClick={() => setActiveFilter('battery')}
            aria-pressed={activeFilter === 'battery'}
          >'''
)

# Add aria-hidden to icons
content = content.replace(
    '<Sun size={12} className="pill-icon" />',
    '<Sun size={12} className="pill-icon" aria-hidden="true" />'
)

content = content.replace(
    '<Zap size={12} className="pill-icon" />',
    '<Zap size={12} className="pill-icon" aria-hidden="true" />'
)

content = content.replace(
    '<BatteryCharging size={12} className="pill-icon" />',
    '<BatteryCharging size={12} className="pill-icon" aria-hidden="true" />'
)

with open("src/components/DashboardHome/EnergyLoadChart.tsx", "w") as f:
    f.write(content)
