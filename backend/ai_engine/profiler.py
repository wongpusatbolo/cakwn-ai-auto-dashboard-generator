import pandas as pd
import numpy as np

def generate_dashboard_data(df: pd.DataFrame):
    # This engine simulates automatically generating charts based on dataset columns
    numeric_cols = df.select_dtypes(include=[np.number]).columns.tolist()
    categorical_cols = df.select_dtypes(include=['object', 'category']).columns.tolist()
    
    dashboard_spec = {
        "kpis": [],
        "charts": []
    }
    
    # Generate KPIs
    for col in numeric_cols[:4]:
        dashboard_spec["kpis"].append({
            "title": f"Total {col}",
            "value": float(df[col].sum()),
            "trend": round(float(df[col].pct_change().mean() * 100), 2) if len(df) > 1 else 0
        })
        
    # Generate Charts
    if categorical_cols and numeric_cols:
        cat_col = categorical_cols[0]
        num_col = numeric_cols[0]
        
        # Bar Chart Data
        bar_data = df.groupby(cat_col)[num_col].sum().reset_index().head(10).to_dict('records')
        dashboard_spec["charts"].append({
            "type": "bar",
            "title": f"{num_col} by {cat_col}",
            "data": bar_data,
            "xKey": cat_col,
            "yKey": num_col
        })
        
        # Pie Chart Data
        if len(numeric_cols) > 1:
            num_col2 = numeric_cols[1]
            pie_data = df.groupby(cat_col)[num_col2].sum().reset_index().head(5).to_dict('records')
            dashboard_spec["charts"].append({
                "type": "pie",
                "title": f"{num_col2} Distribution",
                "data": pie_data,
                "nameKey": cat_col,
                "dataKey": num_col2
            })
            
    # Line Chart for Time Series or Index
    if numeric_cols:
        line_data = df[numeric_cols].head(50).reset_index().to_dict('records')
        dashboard_spec["charts"].append({
            "type": "line",
            "title": f"Trend Analysis",
            "data": line_data,
            "xKey": "index",
            "lines": numeric_cols[:3]
        })
        
    return dashboard_spec
