import json
import re

SUBJECT_TO_UNIT = {
    'Introduction to ICT & Data/Information': 1,
    'Number Systems & Data Representation': 2,
    'Digital Electronics & Logic Circuits': 3,
    'Computer Systems & Architecture': 4,
    'Operating Systems & File Management': 5,
    'Programming Concepts (Python/PHP)': 6,
    'Database Management Systems': 7,
    'Web Development': 8,
    'Data Communication & Networking': 9,
    'Systems Analysis & Design': 10,
    'ICT & Society, Security, E-commerce': 11,
    'General ICT': 12,
}

def escape_sql_string(val):
    if val is None:
        return 'NULL'
    # Escape single quotes
    return "'" + str(val).replace("'", "''") + "'"

def generate_seed_sql():
    with open('q_bank/ict_question_bank.json', 'r', encoding='utf-8') as f:
        data = json.load(f)

    questions = data.get('questions', [])
    print(f"Generating seed SQL for {len(questions)} questions...")

    lines = []
    lines.append("-- Termy A/L ICT Question Bank Seed (2,636 Questions)")
    lines.append("-- Auto-generated from q_bank/ict_question_bank.json\n")

    # Batch inserts in chunks of 100
    chunk_size = 100
    for i in range(0, len(questions), chunk_size):
        chunk = questions[i:i + chunk_size]
        lines.append("INSERT INTO public.questions (id, unit, unit_title, question_text, options, correct_option, explanation, latex_formula, trap_insight, difficulty, topic, past_paper_year, past_paper_number, series)")
        lines.append("VALUES")

        values_parts = []
        for q in chunk:
            qid = q.get('id', f'q_{i}')
            subject = q.get('subject', 'General ICT')
            unit = SUBJECT_TO_UNIT.get(subject, 12)
            q_text = q.get('question', '')
            options = json.dumps(q.get('options', []))
            correct_idx = q.get('correct_answer_index', 0) + 1
            explanation = q.get('explanation', 'Verified with official G.C.E. A/L marking scheme.')
            series = q.get('series', '')

            past_year = 'NULL'
            year_match = re.search(r'20\d{2}', series)
            if year_match:
                past_year = year_match.group(0)

            past_num = 'NULL'
            num_match = re.search(r'\d+', qid)
            if num_match:
                past_num = str(int(num_match.group(0)))

            val_str = (
                f"({escape_sql_string(qid)}, {unit}, {escape_sql_string(subject)}, "
                f"{escape_sql_string(q_text)}, {escape_sql_string(options)}::jsonb, "
                f"{correct_idx}, {escape_sql_string(explanation)}, NULL, NULL, "
                f"'medium', {escape_sql_string(subject)}, {past_year}, {past_num}, {escape_sql_string(series)})"
            )
            values_parts.append(val_str)

        lines.append(",\n".join(values_parts))
        lines.append("ON CONFLICT (id) DO UPDATE SET")
        lines.append("  unit = EXCLUDED.unit,")
        lines.append("  unit_title = EXCLUDED.unit_title,")
        lines.append("  question_text = EXCLUDED.question_text,")
        lines.append("  options = EXCLUDED.options,")
        lines.append("  correct_option = EXCLUDED.correct_option,")
        lines.append("  explanation = EXCLUDED.explanation;\n")

    output_path = 'supabase/seed_questions.sql'
    with open(output_path, 'w', encoding='utf-8') as out:
        out.write("\n".join(lines))

    print(f"Successfully wrote {output_path}")

if __name__ == '__main__':
    generate_seed_sql()
