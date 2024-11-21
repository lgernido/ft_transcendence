FROM python:3.12

WORKDIR /code/backend

COPY . /backend/

COPY tools/requirements.txt .

RUN pip install --upgrade pip && pip install --no-cache-dir -r requirements.txt 

COPY conf/wait-for-it.sh /wait-for-it.sh

COPY conf/build.sh /build.sh

RUN chmod +x /wait-for-it.sh

RUN chmod +x /build.sh

# COPY create_superuser.py /create_superuser.py
# COPY 2f_auth.py /2f_auth.py

# RUN python create_superuser.py
# RUN python 2f_auth.py

EXPOSE 8000

ENTRYPOINT ["/wait-for-it.sh", "db:5432", "--timeout=15", "--", "/build.sh", "--", "python", "src/manage.py", "runserver", "0.0.0.0:8000"]1.0.0