from flask import Blueprint, request, jsonify
import pandas as pd

upload_bp = Blueprint('upload', __name__, url_prefix='/api/upload')

@upload_bp.route('/trainee', methods=['POST'])
def upload_trainee_file():
    file = request.files.get('file')
    if not file:
        return jsonify({'error': 'No file uploaded'}), 400

    try:
        df = pd.read_excel(file)

        data = []
        for _, row in df.iterrows():
            data.append({
                'first_name': row.get('FIRST NAME', ''),
                'middle_name': row.get('MIDDLE NAME', ''),
                'last_name': row.get('LAST NAME', ''),
                'strand': row.get('STRAND', ''),
                'department': row.get('DEPARTMENT', ''),
                'school': row.get('SCHOOL', ''),
                'batch': row.get('BATCH', ''),
                'date_of_immersion': str(row.get('DATE OF IMMERSION', '')),
                'status': row.get('STATUS', '')
            })

        return jsonify({'students': data})

    except Exception as e:
        return jsonify({'error': str(e)}), 500
